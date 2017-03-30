'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.InsertMenuDialogReferences = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InsertMenuDialogReferences = exports.InsertMenuDialogReferences = _react2.default.createClass({
	displayName: 'InsertMenuDialogReferences',

	propTypes: {
		onClose: _react.PropTypes.func,
		isOpen: _react.PropTypes.bool,
		onReferenceAdd: _react.PropTypes.func
	},

	getInitialState: function getInitialState() {
		return {
			// selectedTabIndex: TabIndexes.MANUAL,
			addedFields: ['title', 'author', 'journal', 'year'],
			referenceData: {
				title: '',
				url: '',
				author: '',
				journal: '',
				volume: '',
				number: '',
				pages: '',
				year: '',
				publisher: '',
				doi: '',
				note: ''
			},
			addFieldEnable: false,
			manual: {
				url: '',
				metadata: {}
			},
			savable: false
		};
	},
	render: function render() {
		return _react2.default.createElement(
			_core.Dialog,
			{ isOpen: this.props.isOpen, onClose: this.props.onClose, title: 'Add References' },
			_react2.default.createElement(
				'div',
				{ className: 'pt-dialog-body' },
				_react2.default.createElement(
					'b',
					null,
					'References are kept in a bibtex file (references.bib) stored in your pub. Type \'@\' in the editor to insert references from your this file.'
				),
				'Click here to edit that bibtex file directly - or add new files below'
			)
		);
	}
});

exports.default = InsertMenuDialogReferences;