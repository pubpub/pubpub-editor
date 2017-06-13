'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ExportButton = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _csltobibtex = require('../references/csltobibtex');

var _ExportMenu = require('../ExportMenu');

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

// converter url

var ExportButton = exports.ExportButton = _react2.default.createClass({
	displayName: 'ExportButton',

	propTypes: {
		files: _react.PropTypes.object
	},

	getInitialState: function getInitialState() {
		return {
			exportLoading: undefined,
			exportError: undefined,
			exportUrl: undefined,
			pdftexTemplates: {}
		};
	},


	componentWillMount: function componentWillMount() {
		var _this = this;

		var converterURL = this.props.converterURL;


		var reqURL = converterURL + '/templates';

		if (Object.keys(this.state.pdftexTemplates).length === 0 && this.state.pdftexTemplates.constructor === Object) {
			_superagent2.default.get(reqURL).end(function (err, res) {
				_this.setState({
					pdftexTemplates: res.body
				});
			});
		}
	},

	pollURL: function pollURL(url) {
		var _this2 = this;

		var converterURL = this.props.converterURL;

		var pollUrl = converterURL + url;

		_superagent2.default.get(pollUrl).end(function (err, res) {

			if (!err && res && res.statusCode === 200) {

				if (res.body.url) {

					window.open(res.body.url, "_blank");
					_this2.setState({
						exportLoading: false,
						exportUrl: res.body.url
					});
				} else {
					window.setTimeout(_this2.pollURL.bind(_this2, url), 2000);
				}
			} else if (err) {
				console.log('error is ' + err + ', res is ' + JSON.stringify(res));
				_this2.setState({
					exportError: err + ', ' + res.text,
					exportLoading: false

				});
			}
		});
	},

	convert: function convert() {
		var _this3 = this;

		if (this.state.exportLoading) {
			return false;
		}

		var _props = this.props,
		    converterURL = _props.converterURL,
		    allFiles = _props.allFiles,
		    allReferences = _props.allReferences,
		    content = _props.content,
		    title = _props.title,
		    authors = _props.authors;

		var convertUrl = converterURL;
		var outputType = 'pdf';
		var inputContent = (0, _ExportMenu.markdownToExport)(content, allFiles, allReferences);

		var metadata = { title: title, authors: authors };

		// console.log(`made ${JSON.stringify(inputContent)} \n\n which was \n\n${this.state.content}`)
		console.log(JSON.stringify(inputContent));

		var template = this.state.pdftexTemplates['default'];

		_superagent2.default.post(convertUrl).send({
			inputType: 'ppub',
			outputType: outputType,
			// inputUrl: file.url,
			inputContent: inputContent,
			metadata: metadata,
			options: { template: 'default' }
		}).set('Accept', 'application/json').end(function (err, res) {
			if (err || !res.ok) {
				alert('Oh no! error', err);
			} else {
				var pollUrl = res.body.pollUrl;
				window.setTimeout(_this3.pollURL.bind(_this3, pollUrl), 2000);
				_this3.setState({
					exportLoading: true
				});
			}
		});
	},

	render: function render() {
		var exportLoading = this.state.exportLoading;


		return _react2.default.createElement(
			_core.Button,
			{ loading: exportLoading, onClick: this.convert },
			'Export'
		);
	}

});

exports.default = ExportButton;


styles = {
	button: {}
};