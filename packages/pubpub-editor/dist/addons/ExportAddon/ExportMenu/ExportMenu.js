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

var DragHandle = (0, _reactSortableHoc.SortableHandle)(function () {
	return _react2.default.createElement(
		'span',
		null,
		'::'
	);
});

var SortableItem = (0, _reactSortableHoc.SortableElement)(function (_ref) {
	var value = _ref.value,
	    disabled = _ref.disabled,
	    toggleItem = _ref.toggleItem;

	console.log('got disabled', disabled);
	return _react2.default.createElement(
		'div',
		null,
		_react2.default.createElement(DragHandle, null),
		_react2.default.createElement(_core.MenuItem, {
			text: value,
			label: _react2.default.createElement(
				'label',
				{ className: 'pt-control pt-checkbox' },
				_react2.default.createElement('input', { type: 'checkbox', checked: !disabled }),
				_react2.default.createElement('span', { onClick: toggleItem, className: 'pt-control-indicator' })
			)
		})
	);
});

var SortableList = (0, _reactSortableHoc.SortableContainer)(function (_ref2) {
	var files = _ref2.files,
	    toggleItem = _ref2.toggleItem;

	return _react2.default.createElement(
		_core.Menu,
		null,
		files.map(function (file, index) {
			var toggle = function toggle() {
				toggleItem(index);
			};
			return _react2.default.createElement(SortableItem, {
				key: 'item-' + index,
				index: index,
				toggleItem: toggle,
				disabled: file.disabled,
				value: file.name });
		})
	);
});

var ExportMenu = exports.ExportMenu = _react2.default.createClass({
	displayName: 'ExportMenu',

	propTypes: {
		files: _react.PropTypes.object
	},
	getInitialState: function getInitialState() {
		return { files: this.props.files };
	},

	toggleItem: function toggleItem(index) {
		var files = this.state.files;
		files[index].disabled = !files[index].disabled;
		this.setState({ files: files });
	},

	onSortEnd: function onSortEnd(_ref3) {
		var oldIndex = _ref3.oldIndex,
		    newIndex = _ref3.newIndex;

		this.setState({
			files: (0, _reactSortableHoc.arrayMove)(this.state.files, oldIndex, newIndex)
		});
	},

	render: function render() {
		var files = this.state.files || this.props.files;

		var docFiles = files.filter(function (file) {
			return file.type === 'text/markdown' || file.type === 'ppub';
		});

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-0' },
			_react2.default.createElement(SortableList, { useDragHandle: true, files: docFiles, onSortEnd: this.onSortEnd, toggleItem: this.toggleItem })
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