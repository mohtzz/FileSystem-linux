const path = require('path');

module.exports = {
    entry: './web/static/script.js', // Входная точка вашего JavaScript
    output: {
        filename: 'bundle.js', // Имя выходного файла
        path: path.resolve(__dirname, 'web/static'), // Папка для выходного файла
    },
    module: {
        rules: [
            {
                test: /\.css$/, // Обработка CSS файлов
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    devtool: 'source-map', // Для отладки
    mode: 'development', // Режим разработки
};
