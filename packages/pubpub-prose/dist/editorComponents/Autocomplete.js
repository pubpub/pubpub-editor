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

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('../../style/autosuggest.scss');

var styles = void 0;

var Autocomplete = exports.Autocomplete = _react2.default.createClass({
	displayName: 'Autocomplete',

	propTypes: {
		visible: _react.PropTypes.bool,
		top: _react.PropTypes.number,
		left: _react.PropTypes.number,
		URLs: _react.PropTypes.object,
		input: _react.PropTypes.string,
		onSelection: _react.PropTypes.func,

		localFiles: _react.PropTypes.array,
		localPubs: _react.PropTypes.array,
		localReferences: _react.PropTypes.array,
		localUsers: _react.PropTypes.array,
		localHighlights: _react.PropTypes.array,
		localDiscussions: _react.PropTypes.array,

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

		if ((input === ' ' || !input) && mode === 'local') {
			return this.setState({
				_currentSuggestions: this.appendOptions([], input),
				_selectedIndex: 0
			});
		}

		if (this.state[mode + '-' + input]) {
			return this.setState({
				_currentSuggestions: this.appendOptions(this.state[mode + '-' + input], input),
				_selectedIndex: 0
			});
		}

		var localFiles = this.props.localFiles || [];
		var localPubs = this.props.localPubs || [];
		var localReferences = this.props.localReferences || [];
		var localUsers = this.props.localUsers || [];
		var localHighlights = this.props.localHighlights || [];
		var localDiscussions = this.props.localDiscussions || [];

		// const urlBase = window.location.hostname === 'localhost'
		// 	? 'http://localhost:9876'
		// 	: 'https://www.pubpub.org';

		// const globalCategories = this.props.globalCategories || [];
		var results = void 0;
		switch (mode) {
			case 'pubs':
				return this.getModeResults(mode, 'pub', input, localPubs);
			case 'users':
				return this.getModeResults(mode, 'user', input, localUsers);
			// results = localUsers.filter((item)=> {
			// 	if (input === '' || input === ' ') { return true; }
			// 	return item.username.toLowerCase().indexOf(input.toLowerCase()) > -1;
			// });

			// if (!globalCategories.includes(mode)) {
			// 	return this.setState({ 
			// 		_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
			// 		_selectedIndex: 0,
			// 		[`${mode}-${input}`]: results.slice(0, 10),
			// 	});
			// }
			// return request({ uri: `${urlBase}/search/user?q=${input}`, json: true })
			// .then((response)=> {
			// 	results = results.concat(response);
			// 	this.setState({ 
			// 		_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
			// 		_selectedIndex: 0,
			// 		[`${mode}-${input}`]: results.slice(0, 10),
			// 	});
			// })
			// .catch((err)=> {
			// 	console.log(err);
			// });
			default:
				results = localFiles.filter(function (item) {
					return item.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
				}).map(function (item) {
					return _extends({}, item, { type: 'file' });
				}).concat(localPubs.filter(function (item) {
					return item.firstName.toLowerCase().indexOf(input.toLowerCase()) > -1;
				}).map(function (item) {
					return _extends({}, item, { type: 'pub' });
				})).concat(localReferences.filter(function (item) {
					return item.title.toLowerCase().indexOf(input.toLowerCase()) > -1;
				}).map(function (item) {
					return _extends({}, item, { type: 'reference' });
				})).concat(localUsers.filter(function (item) {
					return item.username.toLowerCase().indexOf(input.toLowerCase()) > -1;
				}).map(function (item) {
					return _extends({}, item, { type: 'user' });
				})).concat(localHighlights.filter(function (item) {
					return item.exact.toLowerCase().indexOf(input.toLowerCase()) > -1;
				}).map(function (item) {
					return _extends({}, item, { type: 'highlight' });
				})).concat(localDiscussions.filter(function (item) {
					return item.title.toLowerCase().indexOf(input.toLowerCase()) > -1;
				}).map(function (item) {
					return _extends({}, item, { type: 'discussion' });
				}));
				// .concat(this.appendObjectType(localDiscussions.filter((item)=> {
				// 	return item.title.indexOf(input) > -1;
				// })), 'discussion');
				return this.setState(_defineProperty({
					_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
					_selectedIndex: 0
				}, mode + '-' + input, results.slice(0, 10)));
		}
	},


	getModeResults: function getModeResults(mode, urlPath, input, localArray) {
		var _this = this;

		var results = void 0;
		var urlBase = window.location.hostname === 'localhost' ? 'http://localhost:9876' : 'https://www.pubpub.org';

		var globalCategories = this.props.globalCategories || [];

		results = localArray.filter(function (item) {
			if (input === '' || input === ' ') {
				return true;
			}
			return item.username.toLowerCase().indexOf(input.toLowerCase()) > -1;
		});
		if (!globalCategories.includes(mode)) {
			return this.setState(_defineProperty({
				_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
				_selectedIndex: 0
			}, mode + '-' + input, results.slice(0, 10)));
		}
		return (0, _requestPromise2.default)({ uri: urlBase + '/search/' + urlPath + '?q=' + input, json: true }).then(function (response) {
			results = results.concat(response);
			_this.setState(_defineProperty({
				_currentSuggestions: _this.appendOptions(results.slice(0, 10), input),
				_selectedIndex: 0
			}, mode + '-' + input, results.slice(0, 10)));
		}).catch(function (err) {
			console.log(err);
		});
	},

	selectResult: function selectResult(index) {
		var item = this.state._currentSuggestions[index];
		if (item.suggestionCategory) {
			this.setState({ _suggestionCategory: item.suggestionCategory });
			this.getNewSelections(this.props.input);
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
			if (this.props.localFiles) {
				localCategories.push('files');
			}
			if (this.props.localPubs) {
				localCategories.push('pubs');
			}
			if (this.props.localReferences) {
				localCategories.push('references');
			}
			if (this.props.localUsers) {
				localCategories.push('users');
			}
			if (this.props.localHighlights) {
				localCategories.push('highlights');
			}
			if (this.props.localDiscussions) {
				localCategories.push('discussions');
			}

			var localCategoryOptions = localCategories.map(function (item) {
				return { id: item, suggestionCategory: item, title: '' + (!isEmpty ? 'search all ' : '') + item };
			});

			var globalCategoryOptions = globalCategories.map(function (item) {
				return { id: item, suggestionCategory: item, title: '' + (!isEmpty ? 'search all ' : '') + item };
			});

			var options = isEmpty ? localCategoryOptions : globalCategoryOptions;
			return [].concat(_toConsumableArray(resultArray), _toConsumableArray(options));
		}
		return resultArray;
	},

	render: function render() {
		var _this2 = this;

		var results = [].concat(_toConsumableArray(this.state._currentSuggestions)) || [];
		if (!results.length) {
			return null;
		}

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-4', style: styles.container(this.props.top, this.props.left, this.props.visible) },
			results.map(function (result, index) {
				var isCategory = !!result.suggestionCategory;
				return _react2.default.createElement(
					'div',
					{ key: 'result-' + result.type + '-' + result.id, style: styles.resultWrapper(_this2.state._selectedIndex === index, isCategory), onMouseEnter: _this2.setCurrentIndex.bind(_this2, index), onClick: _this2.selectResult.bind(_this2, index) },
					result.avatar && _react2.default.createElement('img', { src: result.avatar, style: styles.avatar }),
					_react2.default.createElement(
						'span',
						{ style: styles.title },
						result.firstName,
						' ',
						result.lastName,
						result.title
					),
					result.type && _react2.default.createElement(
						'span',
						{ style: { float: 'right' }, className: 'pt-tag' },
						result.type
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
			padding: '0.5em',
			fontStyle: isCategory ? 'italic' : 'none',
			textAlign: isCategory ? 'center' : 'left',
			textTransform: isCategory ? 'capitalize' : 'none'
		};
	},
	avatar: {
		width: '35px',
		verticalAlign: 'middle'
	},
	title: {
		verticalAlign: 'middle'
	}
};