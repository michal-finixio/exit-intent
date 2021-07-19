# Exit Intent (Desktop + Mobile)

Exit intent detection tool, including support of mobile and desktop.  
Loosely based on https://github.com/thebarty/exit-intent with additional functionality.

<hr />

## Behaviour

**DESKTOP behaviour:**

- trigger intent if mouse leaves body ('mouseleave'-event)
- trigger after user has been inactive for `showAfterInactiveSecondsDesktop` seconds

**MOBILE behaviour:**

- trigger after user has been inactive for `showAfterInactiveSecondsMobile` seconds

<hr />

## Options

`maxDisplays` (default 99999) - maximum number of times exit intent can be triggered.

`onExitIntent` (default no-op function) - function to call when an exit intent has been detected.

`showAfterInactiveSecondsDesktop` (default 60 seconds) - inactivity period after which exit intent function is triggered on desktop. Pass `undefined` to disable.

`showAfterInactiveSecondsMobile` (default 40 seconds) - inactivity period after which exit intent function is triggered on mobile. Pass `undefined` to disable.

`showAgainAfterSeconds` (default 10 seconds) - if exit-intend was triggered, wait for this period until it is possible to trigger it again.

`eventThrottle` (default 200) - event throttle in milliseconds. Period between event trigger and calling of exit intent function.

<hr />

## Usage

### 1. Including ExitIntent in page context with an IIFE

<br />

Include `dist/exit-intent.min.js` in your site:

```html
<script src="/path/to/exit-intent.min.js"></script>
```

You should be able to access `ExitIntent` within page context:

```js
const removeExitIntent = ExitIntent({
  maxDisplays: 99999,                    // default 99999
  eventThrottle: 100,                    // default 200
  showAfterInactiveSecondsDesktop: 60,   // default 60
  showAfterInactiveSecondsMobile: 40,    // default 40
  showAgainAfterSeconds: 10,             // default 10
  onExitIntent: () => {
    console.log('exit-intent triggered');
  },
  debug: false,
})
```

### Usage as npm package

Not yet implemented

<hr />

## Build

Install dependencies: `yarn`  
Build script: `yarn build`

For pretty version, disable `uglify` plugin in rollup config.