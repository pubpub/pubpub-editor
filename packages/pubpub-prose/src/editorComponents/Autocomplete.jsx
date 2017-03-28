import React, { PropTypes } from 'react';
import Radium from 'radium';
import request from 'request-promise';

require('../../style/autosuggest.scss');

let styles;

export const Autocomplete = React.createClass({
	propTypes: {
		visible: PropTypes.bool,
		top: PropTypes.number,
		left: PropTypes.number,
		URLs: PropTypes.object,
		input: PropTypes.string,
		onSelection: PropTypes.func,

		localFiles: PropTypes.array,
		localPubs: PropTypes.array,
		localReferences: PropTypes.array,
		localUsers: PropTypes.array,
		localHighlights: PropTypes.array,
		localDiscussions: PropTypes.array,

		globalCategories: PropTypes.array, // ['highlights', 'discussions', 'users']
	},

	getInitialState() {
		return { 
			_suggestionCategory: null, 
			_currentSuggestions: this.appendOptions([]),
			_selectedIndex: 0,
			_loading: false
		};
	},

	componentDidMount() {
		window.addEventListener('keydown', this.onKeyEvents);
	},

	componentWillReceiveProps(nextProps) {
		if (this.props.input !== nextProps.input || (!this.props.visible && nextProps.visible)) {
			this.getNewSelections(nextProps.input);
		}
		if (!nextProps.visible) {
			this.setState({
				_selectedIndex: 0,
				_suggestionCategory: null,
			});
		}
	},

	componentWillUnmont() {
		window.removeEventListener('keydown', this.onKeyEvents);
	},

	onKeyEvents(evt) {
		if (!this.props.visible) { return null; }

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

	setCurrentIndex: function(index) {
		this.setState({ _selectedIndex: index });
	},

	getNewSelections(input) {
		const mode = this.state._suggestionCategory || 'local';

		if ((input === ' ' || !input) && mode === 'local') {
			return this.setState({ 
				_currentSuggestions: this.appendOptions([]),
				_selectedIndex: 0,
			});
		}

		if (this.state[`${mode}-${input}`]) { 
			return this.setState({ 
				_currentSuggestions: this.appendOptions(this.state[`${mode}-${input}`]),
				_selectedIndex: 0,
			});
		}

		
		const localFiles = this.props.localFiles || [];
		const localPubs = this.props.localPubs || [];
		const localReferences = this.props.localReferences || [];
		const localUsers = this.props.localUsers || [];
		const localHighlights = this.props.localHighlights || [];
		const localDiscussions = this.props.localDiscussions || [];

		const urlBase = window.location.hostname === 'localhost'
			? 'http://localhost:9876'
			: 'https://www.pubpub.org';


		let results;
		switch (mode) {
		case 'pubs':
			results = localPubs.filter((item)=> {
				return item.username.toLowerCase().indexOf(input.toLowerCase()) > -1;
			});
			return request({ uri: `${urlBase}/search/pub?q=${input}`, json: true })
			.then((response)=> {
				results = results.concat(response);
				this.setState({ 
					_currentSuggestions: this.appendOptions(results.slice(0, 10)),
					_selectedIndex: 0,
					[`${mode}-${input}`]: results.slice(0, 10),
				});
			})
			.catch((err)=> {
				console.log(err);
			});
		case 'users':
			results = localUsers.filter((item)=> {
				return item.username.toLowerCase().indexOf(input.toLowerCase()) > -1;
			});
			return request({ uri: `${urlBase}/search/user?q=${input}`, json: true })
			.then((response)=> {
				results = results.concat(response);
				this.setState({ 
					_currentSuggestions: this.appendOptions(results.slice(0, 10)),
					_selectedIndex: 0,
					[`${mode}-${input}`]: results.slice(0, 10),
				});
			})
			.catch((err)=> {
				console.log(err);
			});
		default: 
			results = localFiles.filter((item)=> {
				return item.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
			}).map(item => { return { ...item, type: 'file' }; })
			.concat(localPubs.filter((item)=> {
				return item.firstName.toLowerCase().indexOf(input.toLowerCase()) > -1;
			}).map(item => { return { ...item, type: 'pub' }; }))
			.concat(localReferences.filter((item)=> {
				return item.title.toLowerCase().indexOf(input.toLowerCase()) > -1;
			}).map(item => { return { ...item, type: 'reference' }; }))
			.concat(localUsers.filter((item)=> {
				return item.username.toLowerCase().indexOf(input.toLowerCase()) > -1;
			}).map(item => { return { ...item, type: 'user' }; }))
			.concat(localHighlights.filter((item)=> {
				return item.exact.toLowerCase().indexOf(input.toLowerCase()) > -1;
			}).map(item => { return { ...item, type: 'highlight' }; }))
			.concat(localDiscussions.filter((item)=> {
				return item.title.toLowerCase().indexOf(input.toLowerCase()) > -1;
			}).map(item => { return { ...item, type: 'discussion' }; }));
			// .concat(this.appendObjectType(localDiscussions.filter((item)=> {
			// 	return item.title.indexOf(input) > -1;
			// })), 'discussion');
			return this.setState({ 
				_currentSuggestions: this.appendOptions(results.slice(0, 10)),
				_selectedIndex: 0,
				[`${mode}-${input}`]: results.slice(0, 10),
			});
		}

		// If there is no suggestioncategory, search all local
		// If there is a category - search local of that category
		// If less than 10, search for global of that category

		
		// request({ uri: `${urlBase}/search/user?q=${input}`, json: true })
		// .then((response)=> {
		// 	this.setState({ 
		// 		_currentSuggestions: response.slice(0, 10),
		// 		_selectedIndex: 0,
		// 		[input]: response.slice(0, 10),

		// 	});
		// })
		// .catch((err)=> {
		// 	console.log(err);
		// });
	},

	selectResult: function(index) {
		const item = this.state._currentSuggestions[index];
		if (item.suggestionCategory) {
			this.setState({ _suggestionCategory: item.suggestionCategory });
			this.getNewSelections(this.props.input);
		} else {
			this.props.onSelection(item);	
		}
	},

	appendOptions: function(resultArray = []) {
		if ((!this.state || !this.state._suggestionCategory) && resultArray.length < 10) {
			return [
				...resultArray,
				{ id: 'pubs', suggestionCategory: 'pubs', title: `${resultArray.length ? 'Search All ' : ''}Pubs` },
				{ id: 'users', suggestionCategory: 'users', title: `${resultArray.length ? 'Search All ' : ''}Users` },
			];
		}
		return resultArray;
	},
	// appendObjectType: function(array, type) {
	// 	return array.map((item)=> {
	// 		return { ...item, type: type };
	// 	});
	// },

	render() {
		const results = [...this.state._currentSuggestions] || [];
		// if (results.length < 10 && !this.state._suggestionCategory) {
		// 	results.push({ id: 'users', suggestionCategory: 'users', title: 'Search All Users' });
		// 	results.push({ id: 'pubs', suggestionCategory: 'pubs', title: 'Search All Pubs' });
		// }
		if (!results.length) { return null; }

		return (
			<div className={'pt-card pt-elevation-4'} style={styles.container(this.props.top, this.props.left, this.props.visible)}>
				{results.map((result, index)=> {
					return (
						<div key={`result-${result.type}-${result.id}`} style={styles.resultWrapper(this.state._selectedIndex === index)} onMouseEnter={this.setCurrentIndex.bind(this, index)} onClick={this.selectResult.bind(this, index)}>
							<img src={result.avatar} style={styles.avatar} />
							<span style={styles.title}>{result.firstName} {result.lastName}{result.title}</span>
							{result.type &&
								<span style={{ float: 'right'}} className={'pt-tag'}>{result.type}</span>
							}
							
						</div>
					);
				})}
			</div>
		);
	},
});

export default Radium(Autocomplete);

styles = {
	container: function(top, left, visible) {
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
	resultWrapper: function(selected) {
		return {
			backgroundColor: selected ? '#DDD' : 'transparent',
			margin: '0.25em 0em',
			cursor: 'pointer',
			padding: '0.5em',
		};
		
	},
	avatar: {
		width: '35px',
		verticalAlign: 'middle',
	},
	title: {
		verticalAlign: 'middle',
	},
};
