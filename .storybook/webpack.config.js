/* eslint-disable no-param-reassign */
const { resolve } = require('path');

module.exports = (baseConfig) => {
	baseConfig.module.rules.push(
		{
			test: /\.scss$/,
			use: [
				{ loader: 'style-loader' }, // creates style nodes from JS strings
				{ loader: 'css-loader' }, // translates CSS into CommonJS
				{ loader: 'sass-loader' } // compiles Sass to CSS
			]
		}
	);
	baseConfig.module.rules.push(
		{
			test: /\.(ttf|eot|svg|woff|woff2)$/,
			use: [
				{ loader: 'file-loader' }
			]
		}
	);

	baseConfig.resolve.modules = [
		resolve(__dirname, '../src'),
		resolve(__dirname, '../stories'),
		'node_modules'
	];
	return baseConfig;
};
