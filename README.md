# Exit Intent (Desktop + Mobile)

Exit intent detection script, including support of various triggers on mobile and desktop.  

Builds with `rollup` and `babel` to an IIFE to be included in the document. (`./dist/exit-intent.min.js`).

Uses `is-touch-device` (https://www.npmjs.com/package/is-touch-device) to distinguish between desktop and mobile and `lodash-throttle` (https://www.npmjs.com/package/lodash.throttle) for event throttling.

Loosely based on https://github.com/thebarty/exit-intent with additional functionality.

<hr />

## Behaviour

**SHARED behaviour:**

- maximum number of displays can be set, beyond which exit intent will not be fired anymore
- time that has to pass until next exit intent can fire can be set with `showAgainAfterSeconds` not to bug user too much

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
- triggers after user scrolls fast to the top of the page (address bar)
  - disabled by default, to enable set `enableOnFastScrollTopMobile` to `true`
  - triggers, after user scrolls towards address bar from beyond `scrollTopStartingArticleDepth` point and reaches top of the article within `scrollTopSecondsToScroll` seconds

<hr />

## Usage

### 1. Including ExitIntent in page context with an IIFE

<br />

Include `dist/exit-intent.min.js` in your site:

```html
<script src="/path/to/exit-intent.min.js"></script>
```

You should be able to access `ExitIntent` within page context. To initialise, call it with your parameters.  
If parameters are not provided, their default value will be used. 

```js
var removeExitIntent = ExitIntent({
  maxDisplays: 3,                        // default 99999
  showAgainAfterSeconds: 60,             // default 30
  showAfterInactiveSecondsDesktop: 60,   // default 60
  showAfterInactiveSecondsMobile: 40,    // default 40
  showAgainAfterSeconds: 10,             // default 40
  onExitIntent: () => {                  // default no-op function
    alert('Show a modal');
  },
  // other parameters...
});
```

If in some case exit intent is no longer desired, to clean up call cleanup function (`removeExitIntent`).

```js
removeExitIntent();
```

### Usage as npm package

Not yet implemented

<hr />

## Configuration

### Basic:

`onExitIntent` (default no-op function) - function to call when an exit intent has been detected.

`showAgainAfterSeconds` (default 30) - if exit intend was triggered, wait for this period until it is possible to trigger it again. Useful not to annoy the user.

`maxDisplays` (default 99999) - maximum number of times exit intent can be triggered.

### Enabling specific triggers:

`enableOnInactivityDesktop` (default true) - flag to enable inactivity trigger on desktop.

`showAfterInactiveSecondsDesktop` (default 60) - inactivity period after which exit intent function is triggered on desktop.

`enableOnInactivityMobile` (default true) - flag to enable inactivity trigger on mobile.

`showAfterInactiveSecondsMobile` (default 40) - inactivity period after which exit intent function is triggered on mobile.

`enableOnMouseleaveDesktop` (default trye) - flag to enable on mouseleave trigger on desktop. When mouse leaves the document, exit intent will be triggered.

`enableOnBlurMobile` (default false) - flag to enable on blur trigger on mobile. When window loses focus, exit intent will be triggered.

`enableOnScrollBottomMobile` (default false) - flag to enable on scroll to bottom of the page trigger on mobile.

`scrollBottomOffsetPx` (default 200) - offset of pixels, how far from the bottom exit intent will be triggered when scrolling to the bottom.

`enableOnFastScrollTopMobile` (default false) - flag to enable on fast scroll to top trigger on mobile. When user scrolls fast towards the top, exit intent will be triggered.

`scrollTopStartingArticleDepth` (default 0.5) - Article depth, that scrolling from towards top (address bar) can trigger the intent. Between 0.1 and 1.

`scrollTopSecondsToScroll` (default 2) - Time within which scrolling to top must happen to trigger the exit intent.

### Technical:

`debug` (default false) - flag to enable debug logging of the tool.

`eventThrottle` (default 200) - event throttle in milliseconds. Period of throttling time between event trigger and exit intent callback.

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