'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Autocomplete = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _fuzzysearch = require('fuzzysearch');

var _fuzzysearch2 = _interopRequireDefault(_fuzzysearch);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

require('../../style/autosuggest.scss');

var styles = void 0;

var Autocomplete = exports.Autocomplete = _react2.default.createClass({
	displayName: 'Autocomplete',

	propTypes: {
		visible: _react.PropTypes.bool,
		top: _react.PropTypes.number,
		left: _react.PropTypes.number,
		input: _react.PropTypes.string,
		onSelection: _react.PropTypes.func,

		localFiles: _react.PropTypes.array, // Used on Pubs. No Global at the moment
		localPubs: _react.PropTypes.array, // Used in Journals. Local = Feature
		localReferences: _react.PropTypes.array, // Used in Pubs. No Global at the moment
		localUsers: _react.PropTypes.array, // Used in Discussions.
		localHighlights: _react.PropTypes.array, // Used in Discussions. No Global at the moment
		localDiscussions: _react.PropTypes.array, // Used in Discussions. No Global at the moment
		localPages: _react.PropTypes.array, // Used in Journals. No Global at the moment

		globalCategories: _react.PropTypes.array },

	getInitialState: function getInitialState() {
		return {
			_suggestionCategory: null,
			_currentSuggestions: this.appendOptions([], ''),
			_selectedIndex: 0,
			_loading: false
		};
	},
	componentDidMount: function componentDidMount() {
		window.addEventListener('keydown', this.onKeyEvents);
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.input !== nextProps.input || !this.props.visible && nextProps.visible) {
			this.getNewSelections(nextProps.input);
		}
		if (!nextProps.visible) {
			this.setState({
				_selectedIndex: 0,
				_suggestionCategory: null
			});
		}
	},
	componentWillUnmount: function componentWillUnmount() {
		window.removeEventListener('keydown', this.onKeyEvents);
	},
	onKeyEvents: function onKeyEvents(evt) {
		if (!this.props.visible) {
			return null;
		}

		if (evt.key === 'ArrowUp') {
			return this.setCurrentIndex(Math.max(this.state._selectedIndex - 1, 0));
		}
		if (evt.key === 'ArrowDown') {
			return this.setCurrentIndex(Math.min(this.state._selectedIndex + 1, this.state._currentSuggestions.length - 1));
		}
		if (evt.key === 'Enter') {
			return this.selectResult(this.state._selectedIndex);
		}
		return null;
	},


	setCurrentIndex: function setCurrentIndex(index) {
		this.setState({ _selectedIndex: index });
	},

	getNewSelections: function getNewSelections(input) {
		var mode = this.state._suggestionCategory || 'local';

		// If we're in the starting state - no input, no mode selected, we show the default Category options
		if ((input === ' ' || !input) && mode === 'local') {
			return this.setState({
				_currentSuggestions: this.appendOptions([], input),
				_selectedIndex: 0
			});
		}

		// If we already have the result of this query in memory, use it rather than recalculating
		if (this.state[mode + '-' + input]) {
			return this.setState({
				_currentSuggestions: this.appendOptions(this.state[mode + '-' + input], input),
				_selectedIndex: 0
			});
		}

		// Switch between modes to gather suggestions. Default = local, all types shown.
		var results = void 0;
		switch (mode) {
			case 'pubs':
				return this.getModeResults(mode, 'pub', input, this.props.localPubs);
			case 'users':
				return this.getModeResults(mode, 'user', input, this.props.localUsers);
			case 'files':
				return this.getModeResults(mode, 'file', input, this.props.localFiles);
			case 'references':
				return this.getModeResults(mode, 'reference', input, this.props.localReferences);
			case 'highlights':
				return this.getModeResults(mode, 'highlight', input, this.props.localHighlights);
			case 'pages':
				return this.getModeResults(mode, 'page', input, this.props.localPages);
			default:
				results = [].concat(_toConsumableArray(this.getLocalResults('file', input, this.props.localFiles)), _toConsumableArray(this.getLocalResults('pub', input, this.props.localPubs)), _toConsumableArray(this.getLocalResults('reference', input, this.props.localReferences)), _toConsumableArray(this.getLocalResults('user', input, this.props.localUsers)), _toConsumableArray(this.getLocalResults('highlight', input, this.props.localHighlights)), _toConsumableArray(this.getLocalResults('page', input, this.props.localPages)), _toConsumableArray(this.getLocalResults('discussion', input, this.props.localDiscussions)));

				return this.setState(_defineProperty({
					_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
					_selectedIndex: 0
				}, mode + '-' + input, results.slice(0, 10)));
		}
	},


	getLocalResults: function getLocalResults(itemType, input) {
		var localArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

		var searchKeysObject = {
			file: ['name'],
			pub: ['slug', 'title', 'description'],
			reference: ['key', 'title', 'author'],
			user: ['firstName', 'lastName', 'username'],
			highlight: ['exact'],
			discussion: ['title']
		};
		var searchKeys = searchKeysObject[itemType];

		return localArray.filter(function (item) {
			return searchKeys.reduce(function (previous, current) {
				var contained = (0, _fuzzysearch2.default)(input.toLowerCase(), item[current].toLowerCase());
				if (contained) {
					return true;
				}
				return previous;
			}, false);
		}).map(function (item) {
			return _extends({}, item, { itemType: itemType, local: true });
		});
	},

	getModeResults: function getModeResults(mode, itemType, input) {
		var _this = this;

		var localArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

		var globalCategories = this.props.globalCategories || [];
		var emptySearch = input === '' || input === ' ';
		var urlBase = window.location.hostname === 'localhost' ? 'http://localhost:9876' : 'https://www.pubpub.org';

		// Get local results for this category
		var localResults = emptySearch ? localArray.map(function (item) {
			return _extends({}, item, { itemType: itemType, local: true });
		}) : this.getLocalResults(itemType, input, localArray);

		// If we're not allowed this global category or empty search, simply setState with localResults and return
		if (!globalCategories.includes(mode) || emptySearch) {
			return this.setState(_defineProperty({
				_currentSuggestions: this.appendOptions(localResults.slice(0, 10), input),
				_selectedIndex: 0
			}, mode + '-' + input, localResults.slice(0, 10)));
		}

		// If we are allowed this global category, async search
		return (0, _requestPromise2.default)({ uri: urlBase + '/search/' + itemType + '?q=' + input, json: true }).then(function (response) {
			var remoteResults = response.map(function (item) {
				return _extends({}, item, { itemType: itemType, local: false });
			});
			var allResults = [].concat(_toConsumableArray(localResults), _toConsumableArray(remoteResults));
			_this.setState(_defineProperty({
				_currentSuggestions: _this.appendOptions(allResults.slice(0, 10), input),
				_selectedIndex: 0
			}, mode + '-' + input, allResults.slice(0, 10)));
		}).catch(function (err) {
			console.log(err);
		});
	},

	selectResult: function selectResult(index) {
		var _this2 = this;

		var item = this.state._currentSuggestions[index];
		if (item.suggestionCategory) {
			this.setState({ _suggestionCategory: item.suggestionCategory });
			setTimeout(function () {
				_this2.getNewSelections(_this2.props.input);
			}, 0);
		} else {
			this.props.onSelection(item);
		}
	},

	appendOptions: function appendOptions() {
		var resultArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		var input = arguments[1];

		var isEmpty = input === ' ' || !input;
		if ((!this.state || !this.state._suggestionCategory) && resultArray.length < 10) {
			var globalCategories = this.props.globalCategories || [];

			// If it's empty - we need to show local options
			// it if's not, we show global
			var localCategories = [];
			if (this.props.localFiles && this.props.localFiles.length) {
				localCategories.push('files');
			}
			if (this.props.localPubs && this.props.localPubs.length) {
				localCategories.push('pubs');
			}
			if (this.props.localReferences && this.props.localReferences.length) {
				localCategories.push('references');
			}
			if (this.props.localUsers && this.props.localUsers.length) {
				localCategories.push('users');
			}
			if (this.props.localHighlights && this.props.localHighlights.length) {
				localCategories.push('highlights');
			}
			if (this.props.localPages && this.props.localPages.length) {
				localCategories.push('pages');
			}
			if (this.props.localDiscussions && this.props.localDiscussions.length) {
				localCategories.push('discussions');
			}

			var localCategoryOptions = localCategories.map(function (item) {
				return { id: item, suggestionCategory: item, title: item };
			});

			var globalCategoryOptions = globalCategories.map(function (item) {
				return { id: item, suggestionCategory: item, title: 'search all ' + item };
			});

			var options = isEmpty ? localCategoryOptions : globalCategoryOptions;
			return [].concat(_toConsumableArray(resultArray), _toConsumableArray(options));
		}
		return resultArray;
	},

	render: function render() {
		var _this3 = this;

		var results = [].concat(_toConsumableArray(this.state._currentSuggestions)) || [];
		if (!results.length) {
			return null;
		}

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-4', style: styles.container(this.props.top, this.props.left, this.props.visible) },
			results.map(function (result, index) {
				var isCategory = !!result.suggestionCategory;
				var label = result.itemType;
				if (result.itemType === 'pub' && result.local) {
					label = 'Featured Pub';
				}
				if (result.itemType === 'file') {
					label = 'File: ' + result.itemType;
				}
				if (result.itemType === 'reference') {
					label = 'Ref: ' + result.author;
				}
				if (result.itemType === 'highlight') {
					label = 'Highlight';
				}
				if (result.itemType === 'page') {
					label = 'Page';
				}

				var title = result.title;
				if (result.itemType === 'user') {
					title = result.firstName + ' ' + result.lastName;
				}
				if (result.itemType === 'file') {
					title = '' + result.name;
				}
				if (result.itemType === 'highlight') {
					title = '' + result.exact;
				}
				if (result.itemType === 'page') {
					title = '' + result.title;
				}

				var avatar = void 0;
				if (result.avatar) {
					avatar = result.avatar;
				}
				if (result.type === 'image/jpeg' || result.type === 'image/png' || result.type === 'image/jpg' || result.type === 'image/gif') {
					avatar = result.url;
				}
				if (result.itemType === 'highlight') {
					avatar = 'https://i.imgur.com/W7JZHpx.png';
				}

				return _react2.default.createElement(
					'div',
					{ key: 'result-' + result.itemType + '-' + result.id, style: styles.resultWrapper(_this3.state._selectedIndex === index, isCategory), onMouseEnter: _this3.setCurrentIndex.bind(_this3, index), onClick: _this3.selectResult.bind(_this3, index) },
					!!avatar && _react2.default.createElement(
						'div',
						{ style: styles.avatarWrapper },
						_react2.default.createElement('img', { src: avatar, style: styles.avatar, role: 'presentation' })
					),
					!avatar && !result.suggestionCategory && _react2.default.createElement(
						'div',
						{ style: styles.avatarWrapper },
						_react2.default.createElement(
							'div',
							{ style: styles.avatarLetter },
							title.substring(0, 1)
						)
					),
					_react2.default.createElement(
						'div',
						{ style: styles.titleWrapper },
						_react2.default.createElement(
							'span',
							{ style: styles.title },
							title
						),
						label && _react2.default.createElement(
							'div',
							{ style: styles.label },
							label
						)
					)
				);
			})
		);
	}
});

exports.default = (0, _radium2.default)(Autocomplete);


styles = {
	container: function container(top, left, visible) {
		return {
			width: '250px',
			padding: '0em',
			zIndex: 10,
			position: 'absolute',
			left: left,
			top: top,
			opacity: visible ? 1 : 0,
			pointerEvents: visible ? 'auto' : 'none',
			transition: '.1s linear opacity'
		};
	},
	resultWrapper: function resultWrapper(selected, isCategory) {
		var backgroundColor = 'transparent';
		if (isCategory) {
			backgroundColor = '#F5F8FA';
		}
		if (selected) {
			backgroundColor = '#E1E8ED';
		}

		return {
			backgroundColor: backgroundColor,
			margin: '0em',
			cursor: 'pointer',
			// padding: '0.5em',
			borderBottom: '1px solid rgba(57, 75, 89, 0.1)',
			// fontStyle: isCategory ? 'italic' : 'none',
			textAlign: isCategory ? 'center' : 'left',
			textTransform: isCategory ? 'capitalize' : 'none',
			display: 'table',
			width: '100%',
			tableLayout: 'fixed'
		};
	},
	avatarWrapper: {
		display: 'table-cell',
		width: '48px',
		verticalAlign: 'top'
	},
	avatar: {
		width: '48px',
		maxHeight: '48px',
		padding: '8px',
		borderRadius: '11px'
	},
	avatarLetter: {
		fontSize: '1.5em',
		fontWeight: 'bold',
		textTransform: 'uppercase',
		lineHeight: 1,
		padding: '8px'
	},
	titleWrapper: {
		verticalAlign: 'top',
		display: 'table-cell',
		width: 'calc(100% - 48px)',
		padding: '8px 12px 8px 0px'

	},
	title: {
		width: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'inline-block'
	},
	label: {
		fontSize: '0.9em',
		opacity: '0.85',
		marginTop: '-4px',
		width: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'inline-block'
	}
};