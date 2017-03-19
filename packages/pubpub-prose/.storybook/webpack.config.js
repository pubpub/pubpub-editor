const path = require('path');

console.log('LOADING CUSTOM ');

module.exports = {
	module: {
		loaders: [
			{
				test: /\.css$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'sass-loader' }
				],
        include: path.resolve(__dirname, '../')
			},
			{
				test: /\.scss$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'sass-loader' }
				],
        include: path.resolve(__dirname, '../')
			},
			{ test: /\.svg$/, loader: 'file-loader', include: path.resolve(__dirname, '../') },
			{ test: /\.svg$/, loader: 'file-loader', include: path.resolve(__dirname, '../')  },
			{ test: /\.png$/, loader: 'file-loader', include: path.resolve(__dirname, '../')  },
			{ test: /\.jpg$/, loader: 'file-loader', include: path.resolve(__dirname, '../')  },
			{ test: /\.json$/, loader: 'json-loader', include: path.resolve(__dirname, '../../')  },
			{ test: /\.html$/, loader: 'html', include: path.resolve(__dirname, '../')  },
		]
	}
};
