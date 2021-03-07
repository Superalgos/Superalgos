import typescript from 'rollup-plugin-typescript2';

import nodeOs from 'os';
import nodePath from 'path';

import pkg from './package.json';

export default [
    {
        input: 'src/sandwich-stream.ts',
        external: [
            'stream'
        ],
        plugins: [
            typescript({
                cacheRoot: nodePath.join(
                    nodeOs.tmpdir(),
                    String(Date.now),
                    '.rpt2_cache'
                ),
                tsconfigOverride: {
                    compilerOptions: {
                        composite: false
                    }
                }
            })
        ],
        output: [
            {
                file: `${pkg.main}.js`,
                format: 'cjs',
                exports: 'named'
            },
            {
                file: `${pkg.main}.mjs`,
                format: 'esm'
            }
        ]
    }
];
