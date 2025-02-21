const path = require('path');

module.exports = {
    entry: './web/static/script.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'web/static'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    mode: 'development',
};
