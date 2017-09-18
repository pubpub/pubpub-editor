'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderDocumentRebase = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _RenderDocument = require('./RenderDocument');

var _RenderDocument2 = _interopRequireDefault(_RenderDocument);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommitHighlightRebase = function CommitHighlightRebase(_ref) {
	var commit = _ref.commit,
	    acceptCommit = _ref.acceptCommit,
	    index = _ref.index;

	var onClick = function onClick() {
		acceptCommit(index);
	};

	return _react2.default.createElement(
		'div',
		{
			style: { width: '150px', height: 'auto', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer' } },
		commit.description,
		!commit.merged ? _react2.default.createElement(
			'div',
			{ style: { marginTop: 6 } },
			_react2.default.createElement(_core.Button, { minimal: true, onClick: onClick, iconName: 'fork', text: 'Accept' })
		) : _react2.default.createElement(
			'div',
			{ style: { marginTop: 6 } },
			'MERGED'
		)
	);
};

var RenderDocumentRebase = exports.RenderDocumentRebase = _react2.default.createClass({
	displayName: 'RenderDocumentRebase',


	propTypes: {
		doc: _react.PropTypes.object,
		commits: _react.PropTypes.array,
		acceptCommit: _react.PropTypes.func
	},

	getInitialState: function getInitialState() {
		return {
			commitUUID: null
		};
	},


	clickDoc: function clickDoc(evt) {

		var target = evt.target;
		var parent = target;
		var commitUUID = null;
		while (parent = parent.parentNode) {
			if (parent && parent.getAttribute && parent.getAttribute('data-commit')) {
				commitUUID = parent.getAttribute('data-commit');
				break;
			}
		}

		if (commitUUID && this.state.commitUUID !== commitUUID) {
			var boundingRect = this.rebaseContainer.getBoundingClientRect();
			this.setState({ commitUUID: commitUUID, commitX: evt.clientX - boundingRect.left, commitY: evt.clientY - boundingRect.top });
		} else {
			this.setState({ commitUUID: null });
		}
	},

	render: function render() {
		var _this = this;

		var _props = this.props,
		    doc = _props.doc,
		    commits = _props.commits,
		    acceptCommit = _props.acceptCommit;
		var _state = this.state,
		    commitUUID = _state.commitUUID,
		    commitX = _state.commitX,
		    commitY = _state.commitY;


		var selectedCommit = null;
		var selectedIndex = null;
		if (commitUUID !== null) {
			selectedIndex = commits.findIndex(function (commit) {
				return commit.uuid === commitUUID;
			});
			selectedCommit = commits[selectedIndex];
		}

		var mergedCommits = commits.filter(function (commit) {
			return commit.merged;
		});

		return _react2.default.createElement(
			'div',
			{ className: 'rebaseDocument', ref: function ref(rebaseContainer) {
					_this.rebaseContainer = rebaseContainer;
				}, style: { position: 'relative' }, onClick: this.clickDoc },
			_react2.default.createElement(
				'style',
				null,
				commitUUID !== null && '\n  \t\t\t\t\t\t.rebaseDocument [data-commit="' + commitUUID + '"] {\n  \t\t\t\t\t\t\tbackground-color: red !important;\n  \t\t\t\t\t\t}\n  \t\t\t\t\t',
				mergedCommits.map(function (commit) {
					return '\n                .rebaseDocument [data-commit="' + commit.uuid + '"] {\n    \t\t\t\t\t\t\tbackground-color: green !important;\n    \t\t\t\t\t\t}\n              ';
				}).join(' '),
				'\n  \t\t\t\t\t\t.rebaseDocument [data-commit] {\n  \t\t\t\t\t\t\tcursor: pointer;\n  \t\t\t\t\t\t}\n  \t\t\t\t\t'
			),
			selectedCommit ? _react2.default.createElement(
				'div',
				{ style: { position: 'absolute', left: commitX, top: commitY } },
				_react2.default.createElement(CommitHighlightRebase, { commit: selectedCommit, index: selectedIndex, acceptCommit: acceptCommit })
			) : null,
			_react2.default.createElement(_RenderDocument2.default, { allReferences: [], allFiles: [], json: doc })
		);
	}
});

exports.default = RenderDocumentRebase;