import React, { PropTypes } from 'react';

import fuzzysearch from 'fuzzysearch';
import request from 'request-promise';

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
		localPages: PropTypes.array, // Used in Journals. No Global at the moment

		globalCategories: PropTypes.array, // ['pubs', 'users']

		containerId: React.PropTypes.string.isRequired,
		view: React.PropTypes.object.isRequired,
		editorState: React.PropTypes.object.isRequired,
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
		case 'files':
			return this.getModeResults(mode, 'file', input, this.props.localFiles);
		case 'references':
			return this.getModeResults(mode, 'reference', input, this.props.localReferences);
		case 'highlights':
			return this.getModeResults(mode, 'highlight', input, this.props.localHighlights);
		case 'pages':
			return this.getModeResults(mode, 'page', input, this.props.localPages);
		default:
			results = [
				...this.getLocalResults('file', input, this.props.localFiles),
				...this.getLocalResults('pub', input, this.props.localPubs),
				...this.getLocalResults('reference', input, this.props.localReferences),
				...this.getLocalResults('user', input, this.props.localUsers),
				...this.getLocalResults('highlight', input, this.props.localHighlights),
				...this.getLocalResults('page', input, this.props.localPages),
				...this.getLocalResults('discussion', input, this.props.localDiscussions),
			];

			console.log(results);
			return this.setState({
				_currentSuggestions: this.appendOptions(results.slice(0, 10), input),
				_selectedIndex: 0,
				[`${mode}-${input}`]: results.slice(0, 10),
			});
		}

	},

	getLocalResults: function(itemType, input, localArray = []) {
		const localCategories = this.getLocalCategories();
		if (!localCategories.includes(`${itemType}s`)) { return []; }

		const searchKeysObject = {
			file: ['name'],
			pub: ['slug', 'title', 'description'],
			reference: ['id', 'title'],
			user: ['firstName', 'lastName', 'username'],
			highlight: ['exact'],
			discussion: ['title'],
		};
		const searchKeys = searchKeysObject[itemType];

		return localArray.filter((item)=> {
			return searchKeys.reduce((previous, current)=> {
				if (item[current]) {
					const contained = fuzzysearch(input.toLowerCase(), item[current].toLowerCase());
					if (contained) { return true; }
				}
				return previous;
			}, false);
		}).map((item) => {
			return { ...item, itemType: itemType, local: true };
		});
	},

	getModeResults: function(mode, itemType, input, localArray = []) {
		const globalCategories = this.props.globalCategories || [];
		const emptySearch = input === '' || input === ' ';
		const urlBase = window.location.hostname === 'localhost'
			? 'http://localhost:9876'
			: 'https://www.pubpub.org/api';

		// Get local results for this category
		const localResults = emptySearch
			? localArray.map(item => { return { ...item, itemType: itemType, local: true }; })
			: this.getLocalResults(itemType, input, localArray);

		// If we're not allowed this global category or empty search, simply setState with localResults and return
		if (!globalCategories.includes(mode) || emptySearch) {
			return this.setState({
				_currentSuggestions: this.appendOptions(localResults.slice(0, 10), input),
				_selectedIndex: 0,
				[`${mode}-${input}`]: localResults.slice(0, 10),
			});
		}

		// If we are allowed this global category, async search
		return request({ uri: `${urlBase}/search/${itemType}?q=${input}`, json: true })
		.then((response)=> {
			const remoteResults = response.map((item)=> {
				return { ...item, itemType: itemType, local: false };
			});
			const allResults = [...localResults, ...remoteResults];
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
			setTimeout(()=>{
				this.getNewSelections(this.props.input);
			}, 0);

		} else {
			this.props.onSelection(item);
		}
	},

	getLocalCategories: function() {
		const localCategories = [];
		if (this.props.localFiles && this.props.localFiles.length) { localCategories.push('files'); }
		if (this.props.localPubs && this.props.localPubs.length) { localCategories.push('pubs'); }
		if (this.props.localReferences && this.props.localReferences.length) { localCategories.push('references'); }
		if (this.props.localUsers && this.props.localUsers.length) { localCategories.push('users'); }
		if (this.props.localHighlights && this.props.localHighlights.length) { localCategories.push('highlights'); }
		if (this.props.localPages && this.props.localPages.length) { localCategories.push('pages'); }
		if (this.props.localDiscussions && this.props.localDiscussions.length) { localCategories.push('discussions'); }
		return localCategories;
	},

	appendOptions: function(resultArray = [], input) {
		const isEmpty = input === ' ' || !input;
		if ((!this.state || !this.state._suggestionCategory) && resultArray.length < 10) {
			const globalCategories = this.props.globalCategories || [];

			// If it's empty - we need to show local options
			// it if's not, we show global
			const localCategories = this.getLocalCategories();
			const mergedCategories = [...new Set([...localCategories, ...globalCategories])];

			const localCategoryOptions = mergedCategories.map((item)=> {
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


	updateMentions(mentionInput) {
		const { containerId } = this.props;
		if (mentionInput) {
			setTimeout(()=> {
				const container = document.getElementById(containerId);
				const mark = document.getElementsByClassName('mention-marker')[0];
				if (!container || !mark) {
					return this.setState({ visible: false });
				}
				const top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
				const left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;
				if (mentionInput !== this.state.input) {
					this.getNewSelections(mentionInput);
				}
				this.setState({
					visible: true,
					top: top,
					left: left,
					input: mentionInput,
				});
			}, 0);
		} else {
			this.setState({ visible: false, _selectedIndex: 0, _suggestionCategory: null });
		}
	},


	render() {

		const { visible, input, top, left } = this.state;

		const results = [...this.state._currentSuggestions] || [];
		const noResultsNoInput = !results.length && (input === '' || input === ' ') && !!this.state._suggestionCategory;
		if (!results.length && !noResultsNoInput) { return null; }

		return (
			<div className={'pt-card pt-elevation-4'} style={styles.container(top, left, visible)}>
				{results.map((result, index)=> {
					const isCategory = !!result.suggestionCategory;
					let label = result.itemType;
					if (result.itemType === 'pub' && result.local) { label = 'Featured Pub'; }
					if (result.itemType === 'file') { label = `File: ${result.itemType}`; }
					if (result.itemType === 'reference') {
						if (result.author && Array.isArray(result.author)) {
							label = `Ref: ${result.author.reduce((previous, current)=> { return previous + `${current.given}${current.given ? ' ' : ''}${current.family}`; }, '')}`;
						} else if (result.id) {
							label = `Ref: ${result.id}`;
						} else {
							label = 'Ref: undefined';
						}

					}
					if (result.itemType === 'highlight') { label = `Highlight`; }
					if (result.itemType === 'page') { label = `Page`; }

					let title = result.title;
					if (result.itemType === 'user') { title = `${result.firstName} ${result.lastName}`; }
					if (result.itemType === 'file') { title = `${result.name}`; }
					if (result.itemType === 'highlight') { title = `${result.exact}`; }
					if (result.itemType === 'page') { title = `${result.title}`; }

					let avatar;
					if (result.avatar) { avatar = result.avatar; }
					if (result.type === 'image/jpeg' || result.type === 'image/png' || result.type === 'image/jpg' || result.type === 'image/gif') { avatar = result.url; }
					if (result.itemType === 'highlight') { avatar = 'https://i.imgur.com/W7JZHpx.png'; }

					return (
						<div key={`result-${result.itemType}-${result.id}`} style={styles.resultWrapper(this.state._selectedIndex === index, isCategory)} onMouseEnter={this.setCurrentIndex.bind(this, index)} onClick={this.selectResult.bind(this, index)}>
							{!!avatar &&
								<div style={styles.avatarWrapper}>
									<img src={avatar} style={styles.avatar} role={'presentation'} />
								</div>
							}

							{!avatar && !result.suggestionCategory &&
								<div style={styles.avatarWrapper}>
									<div style={styles.avatarLetter}>{title.substring(0, 1)}</div>
								</div>
							}

							<div style={styles.titleWrapper}>
								<span style={styles.title}>{title}</span>
								{label &&
									<div style={styles.label}>{label}</div>
								}
							</div>


						</div>
					);
				})}

				{noResultsNoInput &&
					<div style={styles.resultWrapper(false, true)}>
						<div style={styles.titleWrapper}>
							Type to search {this.state._suggestionCategory}
						</div>
					</div>
				}
			</div>
		);
	},
});

// export default Radium(Autocomplete);
export default Autocomplete;

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
			// padding: '0.5em',
			borderBottom: '1px solid rgba(57, 75, 89, 0.1)',
			// fontStyle: isCategory ? 'italic' : 'none',
			textAlign: isCategory ? 'center' : 'left',
			textTransform: isCategory ? 'capitalize' : 'none',
			display: 'table',
			width: '100%',
			tableLayout: 'fixed',
		};

	},
	avatarWrapper: {
		display: 'table-cell',
		width: '48px',
		verticalAlign: 'top',
	},
	avatar: {
		width: '48px',
		maxHeight: '48px',
		padding: '8px',
		borderRadius: '11px',
	},
	avatarLetter: {
		fontSize: '1.5em',
		fontWeight: 'bold',
		textTransform: 'uppercase',
		lineHeight: 1,
		padding: '8px',
	},
	titleWrapper: {
		verticalAlign: 'top',
		display: 'table-cell',
		width: 'calc(100% - 48px)',
		padding: '8px 12px 8px 0px',

	},
	title: {
		width: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'inline-block',
	},
	label: {
		fontSize: '0.9em',
		opacity: '0.85',
		marginTop: '-4px',
		width: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'inline-block',
	},
};
