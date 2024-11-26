const path = require('path');
const glob = require('glob');
const nodeExternals = require('webpack-node-externals');
const { WatchIgnorePlugin } = require('webpack');
const { watch } = require('fs');
const esbuild = require('esbuild');
const { EsbuildPlugin } = require('esbuild-loader');
const WebpackObfuscator = require('webpack-obfuscator');

// Helper function to generate entry object for webpack
function generateEntry(globPath) {
    const entries = {};
    glob.sync(globPath).forEach((file) => {
        const name = path.relative(path.resolve(__dirname, 'src'), file).replace(/\\/g, '/');
        entries[name] = file;
    });
    return entries;
}

module.exports = [
    {
        name: 'client',
        entry: generateEntry('./dist/src/client/**/*.js'), // Adjust glob pattern to include all file types you need
        mode: 'production',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name]',
        },
        target: 'web', // Important for browser environment
        externals: [nodeExternals()], // Important for Node.js environment
        plugins: [
            new WatchIgnorePlugin({
                paths: [/dist\//], // Ignore the ./dist folder
            }),
            new WebpackObfuscator({
                target: 'browser',
                simplify: true,
                transformObjectKeys: true,

                stringArray: true,
                stringArrayEncoding: ['base64'],
                StringArrayIndexesType: ['hexadecimal-number'],
            }),
        ],
        devtool: false, // Disable source maps for client code
        module: {
            rules: [
                {
                    test: /\.js$/, // Adjust according to your file types
                    exclude: /node_modules/,
                    use: {
                        loader: 'esbuild-loader',
                        options: {
                            implementation: esbuild,
                            target: 'es2016'
                        }
                    },
                },
                {
                    test: /\.html$/,
                    use: ['html-loader'],
                },
                // Add other rules for different file types (CSS, images, etc.) as needed
            ],
        },
        optimization: {
            minimizer: [
                new EsbuildPlugin({
                    target: 'es2015'  // Syntax to transpile to (see options below for possible values)
                })
            ]
        },
        resolve: {
            preferRelative: true, // Try to resolve these requests in the current directory
        },
    },
    {
        name: 'server',
        entry: generateEntry('./dist/src/server/server.js'), // Adjust glob pattern to include all file types you need
        mode: 'production',
        output: {
            path: path.resolve(__dirname, 'tmp'),
            // filename: '[name]',
            filename: 'server.js',
            libraryTarget: 'commonjs2', // Important for Node.js modules
        },
        target: 'node', // Important for Node.js environment
        externals: [nodeExternals()], // Important for Node.js environment
        plugins: [
            new WatchIgnorePlugin({
                paths: [/dist\//], // Ignore the ./dist folder
            }),
            new WebpackObfuscator({
                target: 'node',
                simplify: true,
                transformObjectKeys: true,

                stringArray: true,
                stringArrayEncoding: ['base64'],
                StringArrayIndexesType: ['hexadecimal-number'],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$/, // Adjust according to your file types
                    exclude: /node_modules/,
                    use: {
                        loader: 'esbuild-loader',
                        options: {
                            implementation: esbuild,
                            target: 'es2016'
                        }
                    },
                },
                // Add other rules for different file types as needed
            ],
        },
        optimization: {
            minimizer: [
                new EsbuildPlugin({
                    target: 'es2015'  // Syntax to transpile to (see options below for possible values)
                })
            ]
        },
        resolve: {
            preferRelative: true, // Try to resolve these requests in the current directory
        },
    },
    {
        name: 'register-commands',
        entry: './dist/src/server/bot/regester-commands.js', // Adjust glob pattern to include all file types you need
        mode: 'production',
        output: {
            path: path.resolve(__dirname, 'tmp'),
            filename: 'regester-commands.js',
            libraryTarget: 'commonjs2', // Important for Node.js modules
        },
        target: 'node', // Important for Node.js environment
        externals: [nodeExternals()], // Important for Node.js environment
        plugins: [
            new WatchIgnorePlugin({
                paths: [/dist\//], // Ignore the ./dist folder
            }),
            new WebpackObfuscator({
                target: 'node',
                simplify: true,
                transformObjectKeys: true,
                stringArray: true,
                stringArrayEncoding: ['base64'],
                StringArrayIndexesType: ['hexadecimal-number'],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$/, // Adjust according to your file types
                    exclude: /node_modules/,
                    use: {
                        loader: 'esbuild-loader',
                        options: {
                            implementation: esbuild,
                            target: 'es2016',
                        },
                    },
                },
                // Add other rules for different file types as needed
            ],
        },
        optimization: {
            minimizer: [
                new EsbuildPlugin({
                    target: 'es2015', // Syntax to transpile to (see options below for possible values)
                }),
            ],
        },
        resolve: {
            preferRelative: true, // Try to resolve these requests in the current directory
        },
    },

];