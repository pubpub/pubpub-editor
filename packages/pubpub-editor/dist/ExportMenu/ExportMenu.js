'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ExportMenu = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSortableHoc = require('react-sortable-hoc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var SortableItem = (0, _reactSortableHoc.SortableElement)(function (_ref) {
	var value = _ref.value;
	return _react2.default.createElement(_core.MenuItem, { text: value });
});

var SortableList = (0, _reactSortableHoc.SortableContainer)(function (_ref2) {
	var files = _ref2.files;

	return _react2.default.createElement(
		_core.Menu,
		null,
		files.map(function (file, index) {
			return _react2.default.createElement(SortableItem, { key: 'item-' + index, index: index, value: file.name });
		})
	);
});

var ExportMenu = exports.ExportMenu = _react2.default.createClass({
	displayName: 'ExportMenu',

	propTypes: {
		files: _react.PropTypes.object
	},
	getInitialState: function getInitialState() {
		return { input: null };
	},

	render: function render() {
		var files = this.props.files;

		// const files = Object.values(filesMap);

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-0' },
			_react2.default.createElement(SortableList, { files: files })
		);
	}

});

exports.default = ExportMenu;


styles = {
	textInput: {
		height: '80%',
		verticalAlign: 'baseline'
	},
	container: function container(top, left, width) {
		if (!top) {
			return {
				display: 'none'
			};
		}
		return {
			width: width + 'px',
			position: 'absolute',
			height: '30px',
			lineHeight: '30px',
			padding: '0px',
			textAlign: 'center',
			top: top - 40,
			left: Math.max(left - width / 2, -50),
			overflow: 'hidden'
		};
	},
	button: {
		minWidth: '5px',
		padding: '0px 7px',
		fontSize: '1.1em',
		outline: 'none',
		borderRadius: '0px',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	active: {
		color: 'rgba(255, 255, 255, 1)'
	}
};