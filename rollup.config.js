import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from "rollup-plugin-uglify";

export default () => {
    const plugins = [
        resolve(),
        commonjs(),
        babel({
            babelrc: false,
            exclude: 'node_modules/**',
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        loose: true,
                        targets: { browsers: ['last 2 versions', '> 1%'] }
                    }
                ],
            ],
        }),
        uglify()
    ];
    if (process.env.APP_ENV === 'development') {
        plugins.pop();
    }

    return {
        input: 'src/ExitIntent.js',
        plugins,
        output: [
            {
                file: 'dist/exit-intent.min.es.js',
                format: 'es'
            },
            {
                name: "ExitIntent",
                file: 'dist/exit-intent.min.js',
                format: 'iife',
            },
        ]
    };
};
