import throttle from 'lodash.throttle';
import isTouchDevice from 'is-touch-device';

const defaultOptions = {
  maxDisplays: 99999,
  showAgainAfterSeconds: 30,
  showAfterInactiveSecondsDesktop: 60,
  showAfterInactiveSecondsMobile: 40,
  enableOnInactivityDesktop: true,
  enableOnInactivityMobile: true,
  enableOnMouseleaveDesktop: true,
  enableOnBlurMobile: true,
  enableOnScrollBottomMobile: 2500,
  scrollBottomOffsetPx: 200,
  enableOnFastScrollTopMobile: 2500,
  scrollTopStartingArticleDepth: 0.5,
  scrollTopSecondsToScroll: 2,
  eventThrottle: 200,
  debug: false,
  onExitIntent: () => {
    console.log('onExitIntent action');
  }
};

const isDesktop = !isTouchDevice();
const target = isDesktop ? document.body : window;
const documentHeight = document.body.scrollHeight;

const resetTimeoutTriggersDesktop = ['scroll', 'mousemove', 'wheel'];
const resetTimeoutTriggersMobile = ['touchstart', 'touchend', 'touchmove'];

const scrollEventEnabled = (minHeight) => {
  return !!minHeight && documentHeight > minHeight;
}

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
        config.eventThrottle,
      );
      target.addEventListener('mouseleave', handler, false);
      listeners.push({ event: 'mouseleave', handler, target });
    }
  }
  if (!isDesktop) {
    if (config.enableOnBlurMobile) {
      log('register on blur trigger for mobile');
      const handler = throttle(
        () => {
          log('blur trigger');
          displayIntent();
        },
        config.eventThrottle,
      );
      target.addEventListener('blur', handler, false);
      listeners.push({ event: 'blur', handler, target });
    }
    if (scrollEventEnabled(config.enableOnScrollBottomMobile)) {
      log('register on scroll bottom trigger for mobile');
      const handler = throttle(
        () => {
          setTimeout(() => {
            const currentScroll = window.innerHeight + window.scrollY;

            if (currentScroll + config.scrollBottomOffsetPx >= documentHeight) {
              log('scroll to bottom trigger');
              displayIntent();
            }
          }, 100);
        },
        config.eventThrottle
      );
      target.addEventListener('scroll', handler, false);
      listeners.push({ event: 'scroll', handler, target });
    }
    if (scrollEventEnabled(config.enableOnFastScrollTopMobile)) {
      log('register on scroll top trigger for mobile');
      const docThresholdHeight = documentHeight * config.scrollTopStartingArticleDepth;
      let lastTouchTimeStamp = 0;
      const touchstartHandler = (e) => {
        if (window.innerHeight + window.scrollY > docThresholdHeight) {
          lastTouchTimeStamp = e.timeStamp;
        }
      };
      const touchendHandler = (e) => {
        setTimeout(() => {
          if (
            window.scrollY < 100
            && (e.timeStamp - lastTouchTimeStamp) < config.scrollTopSecondsToScroll * 1000
          ) {
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
