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
  onExitIntent: () => {
    console.log('onExitIntent action');
  }
};

const isDesktop = !isTouchDevice();

const resetTimeoutDesktopTriggers = ['scroll', 'mousemove', 'wheel'];
const resetTimeoutMobileTriggers = ['touchstart', 'touchend', 'touchmove'];

export default function ExitIntent(options = {}) {
  const config = { ...defaultOptions, ...options };

  let displays = 0;
  let onMouseleaveHandler;

  // inactivity trigger state
  const timeoutOnDevice = isDesktop
    ? config.showAfterInactiveSecondsDesktop
    : config.showAfterInactiveSecondsMobile;
  const resetTimerTriggers = isDesktop
    ? resetTimeoutDesktopTriggers
    : resetTimeoutMobileTriggers;
  const target = isDesktop ? document.body : window;
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
  if (isDesktop) {
    log('register mouseleave trigger for desktop');
    onMouseleaveHandler = throttle(
      (e) => {
        if (!(e instanceof MouseEvent)) return;
        log('mouseleave trigger');
        displayIntent();
      },
      config.exitIntentThrottle,
    );
    target.addEventListener( 'mouseleave', onMouseleaveHandler, false);
  } else {
    // todo
  }

  // restart inactivity timer
  const restartTimer = () => {
    if (typeof timeoutOnDevice === 'undefined') {
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

  const onEvent = throttle(restartTimer, config.eventThrottle);

  // register events restarting inactivity timer
  resetTimerTriggers.forEach(event => {
    log('registering event for restartTimer', { event, target });
    target.addEventListener(event, onEvent, false);
    resetTimeoutListeners.push({ event, onEvent, target });
  });

  // cleanup function
  const removeEvents = () => {
    log(`cleanup after ${displays} displays`);
    if (onMouseleaveHandler) {
      target.removeEventListener('mouseleave', onMouseleaveHandler);
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

  // return cleanup function
  return removeEvents;
}
