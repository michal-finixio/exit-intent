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
  scrollBottomOffset: 200,
  enableOnScrollTopMobile: false,
  onExitIntent: (cause) => {
    alert(`onExitIntent action - ${cause}`);
  }
};

const isDesktop = !isTouchDevice();
const target = isDesktop ? document.body : window;

const resetTimeoutTriggersDesktop = ['scroll', 'mousemove', 'wheel'];
const resetTimeoutTriggersMobile = ['touchstart', 'touchend', 'touchmove'];


// TODO: split that into smaller parts
export default function ExitIntent(options = {}) {
  const config = { ...defaultOptions, ...options };

  let displays = 0;
  const listeners = [];

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
  let inactivityTimer;

  const log = (...args) => {
    if (config.debug) {
      console.log('[exit-intent-debug]', ...args);
    }
  }

  // trigger onExitIntent callback within specified `maxDisplays` limit
  const doDisplay = (cause) => {
    if (displays < config.maxDisplays) {
      displays += 1;
      log('trigger successtul (after cooldown time)', displays);
      config.onExitIntent(cause);
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
      const handler = throttle(
        (e) => {
          if (!(e instanceof MouseEvent)) return;
          log('mouseleave trigger');
          displayIntent();
        },
        config.exitIntentThrottle,
      );
      target.addEventListener('mouseleave', handler, false);
      listeners.push({ event: 'mouseleave', handler, target });
    }
  } else {
    // mobile triggers
    if (config.enableOnBlurMobile) {
      log('register on blur trigger for mobile');
      const handler = throttle(
        () => {
          log('blur trigger');
          displayIntent();
        },
        config.exitIntentThrottle,
      );
      target.addEventListener('blur', handler, false);
      listeners.push({ event: 'blur', handler, target });
    }
    if (config.enableOnScrollBottomMobile) {
      const handler = throttle(
        () => {
          setTimeout(() => {
            const documentHeight = document.body.scrollHeight;
            const currentScroll = window.innerHeight + window.scrollY;
            
            if (currentScroll + config.scrollBottomOffset >= documentHeight) {
              log('scroll to bottom trigger');
              displayIntent();
            }
          }, 50);
        },
        config.eventThrottle
      );
      target.addEventListener('scroll', handler, false);
      listeners.push({ event: 'scroll', handler, target });
    }
    if (config.enableOnScrollTopMobile) {
      const docMiddle = document.body.scrollHeight / 2;
      let lastTouchTimeStamp = 0;

      const touchstartHandler = (e) => {
        if (window.innerHeight + window.scrollY > docMiddle) {
          lastTouchTimeStamp = e.timeStamp;
        }
      };
      const touchendHandler = (e) => {
        setTimeout(() => {
          if (window.scrollY < 100 && (e.timeStamp - lastTouchTimeStamp) < 2000) {
            log('fast scroll to top trigger');
            displayIntent();
          }
        }, 100);
      };
      target.addEventListener('touchstart', touchstartHandler, false);
      target.addEventListener('touchend', touchendHandler, false);
      listeners.push({ event: 'touchstart', handler: touchstartHandler, target });
      listeners.push({ event: 'touchend', handler: touchendHandler, target });
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
  const handler = throttle(restartTimer, config.eventThrottle);
  resetTimerTriggers.forEach(event => {
    log('registering event for restartTimer', { event, target });
    target.addEventListener(event, handler, false);
    listeners.push({ event, handler, target });
  });

  // cleanup function
  const removeEvents = () => {
    log(`cleanup after ${displays} displays`);
    if (inactivityTimer !== undefined) {
      window.clearTimeout(inactivityTimer);
    }
    listeners.forEach(theListener => {
      const { event, handler, target } = theListener;
      target.removeEventListener(event, handler);
    });
  }

  // start initial inactivity timer
  restartTimer();

  // return cleanup function
  return removeEvents;
}
