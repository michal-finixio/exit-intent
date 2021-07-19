import throttle from 'lodash.throttle';
import isTouchDevice from 'is-touch-device';

const defaultOptions = {
  debug: false,
  maxDisplays: 99999,
  exitIntentThrottle: 200,
  eventThrottle: 200,
  showAfterInactiveSecondsDesktop: 60,
  showAfterInactiveSecondsMobile: 40,
  showAgainAfterSeconds: 10,
  enableOnInactivityDesktop: true,
  enableOnInactivityMobile: true,
  enableOnMouseleaveDesktop: true,
  enableOnBlurMobile: false,
  enableOnScrollBottomMobile: false,
  onExitIntent: () => {
    console.log('onExitIntent action');
  }
};

const isDesktop = !isTouchDevice();

const resetTimeoutTriggersDesktop = ['scroll', 'mousemove', 'wheel'];
const resetTimeoutTriggersMobile = ['touchstart', 'touchend', 'touchmove'];

let displayss = 10;

// TODO: split that into smaller parts
export default function ExitIntent(options = {}) {
  displayss += 1;
  const config = { ...defaultOptions, ...options };

  let displays = 0;
  const target = isDesktop ? document.body : window;

  let onMouseleaveHandlerDesktop;
  let onBlurHandlerMobile;
  let onScrollBottomHandlerMobile;

  // inactivity trigger state
  const inactivityEnabled = isDesktop
    ? config.enableOnInactivityDesktop
    : config.enableOnInactivityMobile;
  const timeoutOnDevice = isDesktop
    ? config.showAfterInactiveSecondsDesktop
    : config.showAfterInactiveSecondsMobile;
  const resetTimerTriggers = isDesktop
    ? resetTimeoutTriggersDesktop
    : resetTimeoutTriggersMobile;
  const resetTimeoutListeners = [];
  let inactivityTimer;

  const log = (...args) => {
    if (config.debug) {
      console.log('[exit-intent-debug]', ...args);
    }
  }

  // trigger onExitIntent callback within specified `maxDisplays` limit
  const doDisplay = () => {
    if (displays < config.maxDisplays) {
      displays += 1;
      log('display onExitIntent', displays);
      config.onExitIntent();
      if (displays >= config.maxDisplays) {
        removeEvents();
      }
    }
  }

  // throttle doDisplay with `showAgainAfterSeconds` delay, to avoid onExitIntent spam
  const displayIntent = throttle(doDisplay, config.showAgainAfterSeconds * 1000, {
    trailing: false
  });

  // register exit intent triggers
  // TODO - maybe extract this, split
  if (isDesktop) {
    if (config.enableOnMouseleaveDesktop) {
      log('register mouseleave trigger for desktop');
      onMouseleaveHandlerDesktop = throttle(
        (e) => {
          if (!(e instanceof MouseEvent)) return;
          log('mouseleave trigger');
          displayIntent();
        },
        config.exitIntentThrottle,
      );
      target.addEventListener('mouseleave', onMouseleaveHandlerDesktop, false);
    }
  } else {
    if (config.enableOnBlurMobile) {
      log('register on blur trigger for mobile');
      onBlurHandlerMobile = throttle(
        () => {
          log('blur trigger');
          displayIntent();
        },
        config.exitIntentThrottle,
      );
      target.addEventListener('blur', onBlurHandlerMobile, false);
    }
    if (config.enableOnScrollBottomMobile) {
      onScrollBottomHandlerMobile = throttle(
        () => {
          const documentHeight = document.body.scrollHeight;
          const currentScroll = window.scrollY + window.innerHeight;
  
          if (currentScroll >= documentHeight) {
            log('scroll to bottom trigger');
            displayIntent();
          }
        },
        config.eventThrottle
      );
      target.addEventListener('scroll', onScrollBottomHandlerMobile, false);
    }
  }

  // restart inactivity timer on activity
  const restartTimer = () => {
    if (inactivityEnabled && typeof timeoutOnDevice === 'undefined') {
      log('exit intent trigger by inactivity is disabled');
      return;
    }
    if (inactivityTimer !== undefined) {
      log('clear inactivity timeout');
      window.clearTimeout(inactivityTimer);
    }
    inactivityTimer = window.setTimeout(() => {
      log(`exit intent trigger by inactivity after ${timeoutOnDevice}s`);
      displayIntent();
    }, timeoutOnDevice * 1000);
  }

  // register events restarting inactivity timer
  const onEvent = throttle(restartTimer, config.eventThrottle);
  resetTimerTriggers.forEach(event => {
    log('registering event for restartTimer', { event, target });
    target.addEventListener(event, onEvent, false);
    resetTimeoutListeners.push({ event, onEvent, target });
  });

  // cleanup function
  const removeEvents = () => {
    log(`cleanup after ${displays} displays`);
    if (onMouseleaveHandlerDesktop) {
      target.removeEventListener('mouseleave', onMouseleaveHandlerDesktop);
    }
    if (onBlurHandlerMobile) {
      target.removeEventListener('blur', onBlurHandlerMobile);
    }
    if (onScrollBottomHandlerMobile) {
      target.removeEventListener('scroll', onScrollBottomHandlerMobile);
    }
    if (inactivityTimer !== undefined) {
      window.clearTimeout(inactivityTimer);
    }
    resetTimeoutListeners.forEach(theListener => {
      const { event, onEvent, target } = theListener;
      target.removeEventListener(event, onEvent);
    })
  }

  // start initial inactivity timer
  restartTimer();
  console.log('d', displayss)

  // return cleanup function
  return removeEvents;
}
