
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Change options to change bahaviour
// onExitIntent callback can be overridden in devtools console with manual initialisation
const EXIT_INTENT_OPTIONS = {
    maxDisplays: 99999,                     // default 99999
    showAgainAfterSeconds: 10,               // default 30
    showAfterInactiveSecondsDesktop: 30,    // default 60
    showAfterInactiveSecondsMobile: 30,     // default 40
    enableOnInactivityDesktop: true,        // default true
    enableOnInactivityMobile: true,         // default true
    enableOnMouseleaveDesktop: true,        // default true
    enableOnBlurMobile: true,               // default false
    enableOnScrollBottomMobile: true,      // default false
    scrollBottomOffset: 200,                // default 200
    enableOnFastScrollTopMobile: true,     // default false
    scrollTopStartingArticleDepth: 0.5,     // default 0.5
    scrollTopSecondsToScroll: 2,            // default 2
    eventThrottle: 200,                     // default 200
    debug: true,                           // default false

};

const app = express();

app.get('/', async (req, res) => {
    try {
        const html = `
        <html>
            <head>
                <title>Exit Intent test</title>
                <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        background-color: lightgray;
                    }
                    h1, p, code {
                        text-align: center;
                    }
                    code {
                        white-space: pre-wrap;
                    }
                </style>
            </head>
            <body>
                <div style="height: 8000px">
                    <h1>Exit intent test</h1>
                    <p>
                        Adjust <b>test-server/EXIT_INTENT_OPTIONS</b> to test different <b>ExitIntent</b> configurations.
                    </p>
                    <p>
                        Check devtools console for debug info.
                    </p>
                    <p>
                        You can also initialise ExitEvent manually in the console by pasting:
                    </p>
                    <code>
                        removeExitIntent();
                        removeExitIntent = ExitIntent({
                            maxDisplays: 99999,
                            exitIntentThrottle: 100,
                            showAfterInactiveSecondsDesktop: 10,
                            showAfterInactiveSecondsMobile: 10,
                            showAgainAfterSeconds: 5,
                            debug: true,
                            onExitIntent: () => alert('Exit Intent callback!'),  
                        });
                    </code>
                </div>
                <p>end</p>
                <script src="exit-intent.min.js"></script>
                <script>
                    var removeExitIntent = ExitIntent(${JSON.stringify(EXIT_INTENT_OPTIONS)});
                </script>
            </body>
        </html>
        `;
        
        res.send(html);
        res.end();
    } catch (e) {
        console.error(e);
    }
});

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
