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

_pdf_viewer.PDFJS.workerSrc = './pdf.worker.min.js';
_pdf_viewer.PDFJS.disableRange = true;

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
		var url = this.props.file.url || '';

		var container = document.getElementById('container');

		var pdfLinkService = new _pdf_viewer.PDFJS.PDFLinkService();
		var pdfViewer = new _pdf_viewer.PDFJS.PDFViewer({
			container: container,
			linkService: pdfLinkService
		});

		pdfLinkService.setViewer(pdfViewer);

		container.addEventListener('pagesinit', function () {
			// We can use pdfViewer now, e.g. let's change default scale.
			pdfViewer.currentScaleValue = 'page-width';
		});

		// Loading document.
		_pdf_viewer.PDFJS.getDocument(url).then(function (pdfDocument) {
			// Document loaded, specifying document for the viewer and
			// the (optional) linkService.
			pdfViewer.setDocument(pdfDocument);
			pdfLinkService.setDocument(pdfDocument, null);
		});

		// const url = this.props.file.url || '';
		// PDFJS.getDocument(url).then((pdf)=> {
		// 	this.setState({ pdf: pdf });
		// 	this.renderPDF();
		// });
		// window.addEventListener('resize', this.renderPDF);
	},
	shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
		var prevFile = this.props.file || {};
		var nextFile = nextProps.file || {};
		return prevFile.url !== nextFile.url;
	},
	componentWillUnmount: function componentWillUnmount() {
		// window.removeEventListener('resize', this.renderPDF);
	},


	// renderPDF: function() {
	// 	const container = document.getElementById('container');
	// 	container.innerHTML = '';
	// 	this.renderPage(1);
	// },

	// renderPage(pageNumber) {
	// 	const pdf = this.state.pdf;
	// 	const container = document.getElementById('container');

	// 	return pdf.getPage(pageNumber).then((pdfPage)=> {
	// 		const scale = container.offsetWidth / pdfPage.getViewport(4 / 3).width;
	// 		// Dunno why 4/3 is the unit there. In other tests, it made sense to just use 1.0
	// 		// See https://github.com/mozilla/pdf.js/issues/5628
	// 		// For optimizations, such as only rendering the visible page: https://github.com/mozilla/pdf.js/issues/7718
	// 		const pdfPageView = new PDFJS.PDFPageView({
	// 			container: container,
	// 			id: pageNumber,
	// 			scale: scale,
	// 			defaultViewport: pdfPage.getViewport(scale),
	// 			textLayerFactory: new PDFJS.DefaultTextLayerFactory(),
	// 			annotationLayerFactory: new PDFJS.DefaultAnnotationLayerFactory()
	// 		});
	// 		pdfPageView.setPdfPage(pdfPage);
	// 		return pdfPageView.draw();
	// 	})
	// 	.then((thing)=> {
	// 		if (pageNumber < pdf.numPages) {
	// 			return this.renderPage(pageNumber + 1);
	// 		}
	// 		return null;
	// 	});	
	// },

	render: function render() {
		return _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement(_radium.Style, { rules: {
					'.pdfWrapper .page': {
						position: 'relative',
						boxShadow: '0px 2px 5px #888',
						margin: '0px auto 0.5em',
						border: '0px solid transparent',
						borderImage: 'url("") 0 repeat'

					}
				} }),
			_react2.default.createElement(
				'div',
				{ id: 'container', className: 'pdfWrapper', style: styles.container },
				_react2.default.createElement('div', { id: 'viewer', className: 'pdfViewer' })
			)
		);
	}
});

exports.default = (0, _radium2.default)(RenderFilePDF);


styles = {
	container: {
		position: 'relative'
	}

};