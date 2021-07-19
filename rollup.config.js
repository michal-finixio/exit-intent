import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from "rollup-plugin-uglify";

export default {
    input: 'src/ExitIntent.js',
    plugins: [
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
        // uglify()
    ],
    output: [
        {
            file: 'dist/exit-intent-module.js',
            format: 'cjs'
        },
        {
            name: "ExitIntent",
            file: 'dist/exit-intent.js',
            format: 'iife',
        },
    ]
}
