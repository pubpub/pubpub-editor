'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderFilePDF = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _pdf_viewer = require('pdfjs-dist/web/pdf_viewer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_pdf_viewer.PDFJS.workerSrc = '/static/pdf.worker.min.js';

var styles = void 0;

var RenderFilePDF = exports.RenderFilePDF = _react2.default.createClass({
	displayName: 'RenderFilePDF',

	propTypes: {
		file: _react.PropTypes.object
	},
	getInitialState: function getInitialState() {
		return {
			pdf: undefined
		};
	},
	componentDidMount: function componentDidMount() {
		var _this = this;

		var url = this.props.file.url || '';
		_pdf_viewer.PDFJS.getDocument(url).then(function (pdf) {
			_this.setState({ pdf: pdf });
			_this.renderPDF();
		});
		window.addEventListener('resize', this.renderPDF);
	},
	componentWillUnmount: function componentWillUnmount() {
		window.removeEventListener('resize', this.renderPDF);
	},


	renderPDF: function renderPDF() {
		var container = document.getElementById('container');
		container.innerHTML = '';
		this.renderPage(1);
	},

	renderPage: function renderPage(pageNumber) {
		var _this2 = this;

		var pdf = this.state.pdf;
		var container = document.getElementById('container');

		return pdf.getPage(pageNumber).then(function (pdfPage) {
			var scale = container.offsetWidth / pdfPage.getViewport(4 / 3).width;
			// Dunno why 4/3 is the unit there. In other tests, it made sense to just use 1.0
			// See https://github.com/mozilla/pdf.js/issues/5628
			// For optimizations, such as only rendering the visible page: https://github.com/mozilla/pdf.js/issues/7718
			var pdfPageView = new _pdf_viewer.PDFJS.PDFPageView({
				container: container,
				id: pageNumber,
				scale: scale,
				defaultViewport: pdfPage.getViewport(scale),
				textLayerFactory: new _pdf_viewer.PDFJS.DefaultTextLayerFactory(),
				annotationLayerFactory: new _pdf_viewer.PDFJS.DefaultAnnotationLayerFactory()
			});
			pdfPageView.setPdfPage(pdfPage);
			return pdfPageView.draw();
		}).then(function (thing) {
			if (pageNumber < pdf.numPages) {
				return _this2.renderPage(pageNumber + 1);
			}
			return null;
		});
	},
	render: function render() {
		return _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement(_radium.Style, { rules: {
					'.pdfWrapper .page': { position: 'relative', boxShadow: '0px 2px 5px #888', marginBottom: '0.5em' }
				} }),
			_react2.default.createElement('div', { id: 'container', className: 'pdfWrapper', style: styles.container })
		);
	}
});

exports.default = (0, _radium2.default)(RenderFilePDF);


styles = {
	container: {
		position: 'relative'
	}

};