# Exit Intent (Desktop + Mobile)

Exit intent detection script, including support of mobile and desktop.

Loosely based on https://github.com/thebarty/exit-intent with additional functionality.

<hr />

## Behaviour

**SHARED behaviour:**



**DESKTOP behaviour:**

- triggers after mouse leaves the body
  - enabled by default, to disable set `enableOnMouseleaveDesktop` to `false`
  - uses `mouseleave` event
- trigger after user has been inactive for a specified amount of time
  - enabled by default, to disable set `enableOnInactivityDesktop` to `false`
  - inactive time specified with `showAfterInactiveSecondsDesktop` (default 60 seconds)

**MOBILE behaviour:**

- triggers after user has been inactive for a specified amount of time
  - enabled by default, to disable set `enableOnInactivityMobile` to `false`
  - inactive time specified with `showAfterInactiveSecondsMobile` (default 40 seconds)
- triggers after window loses focus
  - disabled by default, to enable set `enableOnBlurMobile` to `true`
  - uses `blue` event
- triggers after user scrolls to the bottom of the page
  - disabled by default, to enable set `enableOnScrollBottomMobile` to `true`
  - uses `scroll` event

<hr />

## Usage

### 1. Including ExitIntent in page context with an IIFE

<br />

Include `dist/exit-intent.min.js` in your site:

```html
<script src="/path/to/exit-intent.min.js"></script>
```

You should be able to access `ExitIntent` within page context. To initialise, call it with your parameters.  
If parameters are not provided, default will be used.

```js
var removeExitIntent = ExitIntent({
  maxDisplays: 99999,                    // default 99999
  showAfterInactiveSecondsDesktop: 60,   // default 60
  showAfterInactiveSecondsMobile: 40,    // default 40
  showAgainAfterSeconds: 10,             // default 10
  exitIntentThrottle: 200,               // default 200
  debug: false,                          // default false
  onExitIntent: () => {                  // default no-op function
    console.log('exit-intent triggered');
  },
});
```

If in some case exit intent is no longer desired, to clean up call `removeExitIntent`.

```js
removeExitIntent();
```

### Usage as npm package

Not yet implemented

<hr />

## Options

`maxDisplays` (default 99999) - maximum number of times exit intent can be triggered.

`onExitIntent` (default no-op function) - function to call when an exit intent has been detected.

`showAfterInactiveSecondsDesktop` (default 60 seconds) - inactivity period after which exit intent function is triggered on desktop. Pass `undefined` to disable.

`showAfterInactiveSecondsMobile` (default 40 seconds) - inactivity period after which exit intent function is triggered on mobile. Pass `undefined` to disable.

`showAgainAfterSeconds` (default 10 seconds) - if exit-intend was triggered, wait for this period until it is possible to trigger it again.

`exitIntentThrottle` (default 200) - event throttle in milliseconds. Period of throttling time between event trigger and exit intent callback.

<hr />

## Build

Install dependencies: `yarn`

Production (minified) build: `yarn build`

Development build: `yarn build:dev`

Build artifacts can be found under `./dist` folder.


<hr />

## Development / testing

For convenience, simple node server returning page with included `ExitIntent` script can be spinned up: `yarn dev`

Access `http://localhost:3000/` to test/debug exit intent.