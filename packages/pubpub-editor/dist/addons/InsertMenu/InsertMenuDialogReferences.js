'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.InsertMenuDialogReferences = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _citationConversion = require('../../utils/references/citationConversion');

var _bibtextocsl = require('../../utils/references/bibtextocsl');

var _bibtextocsl2 = _interopRequireDefault(_bibtextocsl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TabIndexes = {
	MANUAL: 0,
	BIBTEX: 1,
	URL: 2,
	EXISTING: 3
};

var InsertMenuDialogReferences = exports.InsertMenuDialogReferences = _react2.default.createClass({
	displayName: 'InsertMenuDialogReferences',

	propTypes: {
		onClose: _react.PropTypes.func,
		isOpen: _react.PropTypes.bool,
		onReferenceAdd: _react.PropTypes.func
	},

	getInitialState: function getInitialState() {
		return {
			selectedTabIndex: TabIndexes.MANUAL,
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
			savable: false,
			error: null
		};
	},


	inputChange: function inputChange(type, evt) {
		var newReferenceData = _extends({}, this.state.referenceData, _defineProperty({}, type, evt.target.value));

		this.setState({
			referenceData: newReferenceData
		});
	},

	generateBibTexString: function generateBibTexString(jsonInfo) {
		// const fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
		// const map = {
		// 	'journal_title': 'journal',
		// 	'author_instituion': 'institution',
		// };
		var jsonKeys = Object.keys(jsonInfo);
		var id = slugify(jsonInfo['title'] + jsonInfo['year']);
		return '\n\t\t\t@article{' + id + ',\n\t\t\t\t' + jsonKeys.map(function (key) {
			if (jsonInfo[key]) {
				return key + '={' + jsonInfo[key] + '}';
			}
			return null;
		}).filter(function (value) {
			return !!value;
		}).join(',') + '\n\t\t\t}\n\t\t';
	},
	addField: function addField(field) {
		var newFields = this.state.addedFields;
		newFields.push(field);
		this.setState({ addedFields: newFields });
	},
	onFieldChange: function onFieldChange() {
		this.setState({ addFieldEnable: true });
	},
	saveReference: function saveReference() {
		var selectedTabIndex = this.state.selectedTabIndex;

		var citationData = {};
		var bibTexString = void 0;

		if (selectedTabIndex === TabIndexes.MANUAL) {
			bibTexString = (0, _citationConversion.generateBibTexString)(this.state.referenceData);
		} else if (selectedTabIndex === TabIndexes.BIBTEX) {
			bibTexString = this.bibtexText.value;
		}

		var cslJSON = (0, _bibtextocsl2.default)(bibTexString);

		if (cslJSON && cslJSON[0]) {
			// const randomCitationId = (!cslJSON.id || isNaN(cslJSON.id)) ? Math.round(Math.random()*100000000) : cslJSON.id;
			// 	cslJSON.id = String(randomCitationId);
			this.props.onReferenceAdd(cslJSON[0]);
		} else {
			console.log('IMPRPOPER BIBTEX');
			this.setState({ error: true });
		}
	},
	changedTab: function changedTab(selectedTabIndex, prevSelectedTabIndex) {
		this.setState({ selectedTabIndex: selectedTabIndex });
	},
	render: function render() {
		var _this = this;

		var allFields = Object.keys(this.state.referenceData);
		var addedFields = this.state.addedFields;
		var notAdded = allFields.filter(function (index) {
			return addedFields.indexOf(index) === -1;
		});

		var manualAddPopover = _react2.default.createElement(
			_core.Menu,
			null,
			notAdded.map(function (key, index) {
				return _react2.default.createElement(_core.MenuItem, { key: key, onClick: _this.addField.bind(_this, key), text: key });
			})
		);

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
				'Click here to edit that bibtex file directly - or add new files below',
				_react2.default.createElement(
					_core.Tabs,
					{ onChange: this.changedTab, selectedTabIndex: this.state.selectedTabIndex },
					_react2.default.createElement(
						_core.TabList,
						null,
						_react2.default.createElement(
							_core.Tab,
							{ key: 'manual' },
							'Manual Add'
						),
						_react2.default.createElement(
							_core.Tab,
							{ key: 'bibtex' },
							'Import from BiBTeX'
						)
					),
					_react2.default.createElement(
						_core.TabPanel,
						null,
						addedFields.map(function (key, index) {
							return _react2.default.createElement(
								'div',
								{ key: 'refernceField-' + index },
								_react2.default.createElement(
									'label',
									{ className: 'pt-label', htmlFor: key },
									key,
									_react2.default.createElement('input', { style: { width: '80%' }, className: 'pt-input', ref: key, id: key, name: key, type: 'text', value: _this.state.referenceData[key], onChange: _this.inputChange.bind(_this, key) })
								)
							);
						}),
						_react2.default.createElement(
							'div',
							{ className: 'pt-input-group' },
							_react2.default.createElement(
								_core.Popover,
								{
									content: manualAddPopover,
									interactionKind: _core.PopoverInteractionKind.CLICK,
									popoverClassName: 'pt-popover-content-sizing pt-minimal editorMenuPopover',
									position: _core.Position.TOP,
									useSmartPositioning: false },
								_react2.default.createElement(
									'button',
									{ style: { marginLeft: 0, marginTop: 10 }, type: 'button', className: 'pt-button' },
									_react2.default.createElement('span', { className: 'pt-icon-standard pt-icon-add-to-artifact' }),
									'Add Field',
									_react2.default.createElement('span', { className: 'pt-icon-standard pt-icon-caret-up pt-align-right' })
								)
							)
						)
					),
					_react2.default.createElement(
						_core.TabPanel,
						null,
						!this.state.error ? _react2.default.createElement(
							'div',
							{ className: 'pt-callout' },
							'Paste in BiBTeX data and we will automatically create a reference.'
						) : _react2.default.createElement(
							'div',
							{ className: 'pt-callout pt-intent-danger' },
							'There is an error with the BiBTeX you enter, please fix it and try again!'
						),
						_react2.default.createElement('textarea', { className: 'pt-input pt-fill', dir: 'auto', ref: function ref(input) {
								_this.bibtexText = input;
							} })
					)
				)
			),
			_react2.default.createElement(
				'div',
				{ className: 'pt-dialog-footer' },
				_react2.default.createElement(
					'div',
					{ className: 'pt-dialog-footer-actions' },
					_react2.default.createElement(_core.Button, { onClick: this.saveReference, text: 'Insert' })
				)
			)
		);
	}
});

exports.default = InsertMenuDialogReferences;