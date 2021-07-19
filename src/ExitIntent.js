import throttle from 'lodash.throttle';
import isTouchDevice from 'is-touch-device';

const defaultOptions = {
  debug: false,
  maxDisplays: 99999,
  eventThrottle: 200,
  showAfterInactiveSecondsDesktop: 60,
  showAfterInactiveSecondsMobile: 40,
  showAgainAfterSeconds: 10,
  onExitIntent: () => { }
};

const isDesktop = !isTouchDevice();

const resetTimeoutDesktopTriggers = ['touchstart', 'touchend', 'touchmove'];
const resetTimeoutMobileTriggers = ['scroll', 'mousemove', 'wheel'];

export default function ExitIntent(options = {}) {
  const config = { ...defaultOptions, ...options };

  let displays = 0;
  let mouseleaveLisener;

  // inactivity trigger state
  const timeoutOnDevice = isDesktop
    ? config.showAfterInactiveSecondsDesktop
    : config.showAfterInactiveSecondsMobile;
  const resetTimerTriggers = isDesktop
    ? resetTimeoutDesktopTriggers
    : resetTimeoutMobileTriggers;
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
    const onMouse = (e) => {
      if (!(e instanceof MouseEvent)) {
        return;
      }
      log('mouseleave trigger');
      displayIntent();
    }
    log('register mouseleave trigger for desktop');
    onMouseLeaveListener = document.body.addEventListener(
      'mouseleave',
      throttle(onMouse, config.eventThrottle),
      false
    );
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
      log(`exit intent trigger by inactivity after ${timeoutOnDevice * 1000}`);
      displayIntent();
    }, timeoutOnDevice * 1000);
  }

  // register events restarting inactivity timer
  const registerRestartTimerEvent = (event, target) => {
    log('registering event for restartTimer', event, target);
    const listener = target.addEventListener(
      event,
      throttle(ev => {
        log('throttled to restart timer', event);
        restartTimer();
      }, config.eventThrottle),
      false
    );
    resetTimeoutListeners.push({ event, listener, target });
    return listener;
  };
  const restartTimerTarget = isDesktop ? window : document.body;
  resetTimeoutDesktopTriggers.forEach(triggerName => {
    registerRestartTimerEvent(triggerName, restartTimerTarget);
  });


  // cleanup function
  const removeEvents = () => {
    log(`cleanup after ${displays} displays`);
    if (onMouseLeaveListener) {
      document.body.removeEventListener('mouseleave', onMouseLeaveListener);
    }
    resetTimeoutListeners.forEach(theListener => {
      const { event, listener, target } = theListener;
      target.removeEventListener(event, listener);
    })
  }


  restartTimer(); // start initial timer
}
