import React, {PropTypes} from 'react';
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
	},
	getInitialState() {
		return { 
			_suggestionCategory: null, 
			_currentSuggestions: [],
			_selectedIndex: 0,
			_loading: false
		};
	},

	componentDidMount() {
		window.addEventListener("keydown", this.onKeyEvents);
	},

	componentWillReceiveProps(nextProps) {
		if (this.props.input !== nextProps.input) {
			this.getNewSelections(nextProps.input);
		}
	},

	componentWillUnmont() {
		window.removeEventListener("keydown", this.onKeyEvents);
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
	},

	setCurrentIndex: function(index) {
		this.setState({ _selectedIndex: index});
	},

	getNewSelections(input) {
		if (this.state[input]) { 
			return this.setState({ 
				_currentSuggestions: this.state[input],
				_selectedIndex: 0,
			})
		}

		const urlBase = window.location.hostname === 'localhost'
			? 'http://localhost:9876'
			: 'https://www.pubpub.org';
		request({ uri: `${urlBase}/search/user?q=${input}`, json: true })
		.then((response)=> {
			this.setState({ 
				_currentSuggestions: response.slice(0, 10),
				_selectedIndex: 0,
				[input]: response.slice(0, 10),

			});
		})
		.catch((err)=> {
			console.log(err);
		});
	},

	selectResult: function(index) {
		this.props.onSelection(this.state._currentSuggestions[index]);
	},

	render() {
		const results = this.state._currentSuggestions || [];
		if (!results.length) { return null; }

		return (
			<div className={'pt-card pt-elevation-4'} style={styles.container(this.props.top, this.props.left, this.props.visible)}>
				{results.map((result, index)=> {
					return (
						<div key={`result-${result.id}`} style={styles.resultWrapper(this.state._selectedIndex === index)} onMouseEnter={this.setCurrentIndex.bind(this, index)} onClick={this.selectResult.bind(this, index)}>
							<img src={result.avatar} style={styles.avatar} />
							<span style={styles.title}>{result.firstName} {result.lastName}</span>
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
