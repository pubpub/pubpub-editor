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
		input: PropTypes.string,
		onSelection: PropTypes.func,

		localFiles: PropTypes.array, // Used on Pubs. No Global at the moment
		localPubs: PropTypes.array, // Used in Journals. Local = Feature
		localReferences: PropTypes.array, // Used in Pubs. No Global at the moment
		localUsers: PropTypes.array, // Used in Discussions.
		localHighlights: PropTypes.array, // Used in Discussions. No Global at the moment
		localDiscussions: PropTypes.array, // Used in Discussions. No Global at the moment

		globalCategories: PropTypes.array, // ['pubs', 'users']
	},

	getInitialState() {
		return { 
			_suggestionCategory: null, 
			_currentSuggestions: this.appendOptions([], ''),
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

	componentWillUnmount() {
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

		// If we're in the starting state - no input, no mode selected, we show the default Category options
		if ((input === ' ' || !input) && mode === 'local') {
			return this.setState({ 
				_currentSuggestions: this.appendOptions([], input),
				_selectedIndex: 0,
			});
		}

		// If we already have the result of this query in memory, use it rather than recalculating
		if (this.state[`${mode}-${input}`]) { 
			return this.setState({ 
				_currentSuggestions: this.appendOptions(this.state[`${mode}-${input}`], input),
				_selectedIndex: 0,
			});
		}

		// Switch between modes to gather suggestions. Default = local, all types shown.
		let results;
		switch (mode) {
		case 'pubs':
			return this.getModeResults(mode, 'pub', input, this.props.localPubs);
		case 'users':
			return this.getModeResults(mode, 'user', input, this.props.localUsers);
		default: 
			results = [
				...this.getLocalResults('file', input, this.props.localFiles),
				...this.getLocalResults('pub', input, this.props.localPubs),
				...this.getLocalResults('reference', input, this.props.localReferences),
				...this.getLocalResults('user', input, this.props.localUsers),
				...this.getLocalResults('highlight', input, this.props.localHighlights),
				...this.getLocalResults('discussion', input, this.props.localDiscussions),
			];

			return this.setState({ 
				_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
				_selectedIndex: 0,
				[`${mode}-${input}`]: results.slice(0, 10),
			});
		}

	},

	getLocalResults: function(type, input, localArray = []) {
		const searchKeysObject = {
			file: ['name'],
			pub: ['slug', 'title', 'description'],
			reference: ['key'],
			user: ['firstName', 'lastName', 'username'],
			highlight: ['exact'],
			discussion: ['title'],
		};
		const searchKeys = searchKeysObject[type];

		return localArray.filter((item)=> { 
			return searchKeys.reduce((previous, current)=> {
				if (item[current].toLowerCase().indexOf(input.toLowerCase()) > -1) { return true; }
				return previous;
			}, false);
		}).map((item) => { 
			return { ...item, type: type, local: true }; 
		});
	},

	getModeResults: function(mode, type, input, localArray = []) {	
		const globalCategories = this.props.globalCategories || [];
		const emptySearch = input === '' || input === ' ';
		const urlBase = window.location.hostname === 'localhost'
			? 'http://localhost:9876'
			: 'https://www.pubpub.org';

		// Get local results for this category
		const localResults = emptySearch
			? localArray.map(item => { return { ...item, type: type, local: true }; }) 
			: this.getLocalResults(type, input, localArray);

		// If we're not allowed this global category or empty search, simply setState with localResults and return
		if (!globalCategories.includes(mode) || emptySearch) {
			return this.setState({ 
				_currentSuggestions: this.appendOptions(localResults.slice(0, 10), input),
				_selectedIndex: 0,
				[`${mode}-${input}`]: localResults.slice(0, 10),
			});
		}

		// If we are allowed this global category, async search
		return request({ uri: `${urlBase}/search/${type}?q=${input}`, json: true })
		.then((response)=> {
			const allResults = localResults.concat(response);
			this.setState({ 
				_currentSuggestions: this.appendOptions(allResults.slice(0, 10), input),
				_selectedIndex: 0,
				[`${mode}-${input}`]: allResults.slice(0, 10),
			});
		})
		.catch((err)=> {
			console.log(err);
		});
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

	appendOptions: function(resultArray = [], input) {
		const isEmpty = input === ' ' || !input;
		if ((!this.state || !this.state._suggestionCategory) && resultArray.length < 10) {
			const globalCategories = this.props.globalCategories || [];

			// If it's empty - we need to show local options
			// it if's not, we show global
			const localCategories = [];
			if (this.props.localFiles && this.props.localFiles.length) { localCategories.push('files'); }
			if (this.props.localPubs && this.props.localPubs.length) { localCategories.push('pubs'); }
			if (this.props.localReferences && this.props.localReferences.length) { localCategories.push('references'); }
			if (this.props.localUsers && this.props.localUsers.length) { localCategories.push('users'); }
			if (this.props.localHighlights && this.props.localHighlights.length) { localCategories.push('highlights'); }
			if (this.props.localDiscussions && this.props.localDiscussions.length) { localCategories.push('discussions'); }

			const localCategoryOptions = localCategories.map((item)=> {
				return { id: item, suggestionCategory: item, title: item };
			});

			const globalCategoryOptions = globalCategories.map((item)=> {
				return { id: item, suggestionCategory: item, title: `search all ${item}` };
			});
			
			const options = isEmpty ? localCategoryOptions : globalCategoryOptions;
			return [
				...resultArray,
				...options,
			];
		}
		return resultArray;
	},


	render() {
		const results = [...this.state._currentSuggestions] || [];
		if (!results.length) { return null; }

		return (
			<div className={'pt-card pt-elevation-4'} style={styles.container(this.props.top, this.props.left, this.props.visible)}>
				{results.map((result, index)=> {
					const isCategory = !!result.suggestionCategory;
					let label = result.type;
					if (result.type === 'pub' && result.local) { label = 'Featured Pub'; }
					return (
						<div key={`result-${result.type}-${result.id}`} style={styles.resultWrapper(this.state._selectedIndex === index, isCategory)} onMouseEnter={this.setCurrentIndex.bind(this, index)} onClick={this.selectResult.bind(this, index)}>
							{result.avatar &&
								<img src={result.avatar} style={styles.avatar} />
							}
							
							<span style={styles.title}>{result.firstName} {result.lastName}{result.title}</span>
							{result.type &&
								<span style={{ float: 'right' }} className={'pt-tag'}>{label}</span>
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
	resultWrapper: function(selected, isCategory) {
		let backgroundColor = 'transparent';
		if (isCategory) { backgroundColor = '#F5F8FA'; }
		if (selected) { backgroundColor = '#E1E8ED'; }
		
		return {
			backgroundColor: backgroundColor,
			margin: '0em',
			cursor: 'pointer',
			padding: '0.5em',
			// fontStyle: isCategory ? 'italic' : 'none',
			textAlign: isCategory ? 'center' : 'left',
			textTransform: isCategory ? 'capitalize' : 'none',
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
