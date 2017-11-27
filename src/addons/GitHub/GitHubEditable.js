import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnchorButton } from '@blueprintjs/core';

require('./gitHub.scss');

const propTypes = {
	isSelected: PropTypes.bool,
	updateAttrs: PropTypes.func.isRequired
};

const defaultProps = {
	isSelected: false
};

class GitHubEditable extends Component {
	constructor(props) {
		super(props);

		this.state = {
			repoList: [],
			searchText: ''
		};

		this.handleRepoSelect = this.handleRepoSelect.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.searchGitHub = this.searchGitHub.bind(this);

		this.typeAhead = null;
	}

	handleRepoSelect(evt) {
		this.props.updateAttrs({url: evt.target.getAttribute('data-url')});
	}

	handleValueChange(evt) {
		this.setState({ searchText: evt.target.value });

		clearTimeout(this.typeAhead);

		this.typeAhead = setTimeout(() => {
			console.log('searching: '+ evt.target.value);
			this.searchGitHub();
		}, 500);
	}

	cleanSearchText(searchText) {
        // remove beginning/ending whitespace
        searchText = searchText.trim();

        // remove remaining multiple whitespaces
        searchText = searchText.replace(/\s+/g, " ");

        return searchText;
	}

	searchGitHub() {
		let searchText = this.cleanSearchText(this.state.searchText);

		if (searchText === '') {
			return;
		}

		window.fetch('https://api.github.com/search/repositories?q='+ this.state.searchText).then(response => {
			if (response.ok) {
				return response.json();
			}

			throw new Error('error fetching from GitHub');
		}).then(responseJSON => {
			this.setState({repoList: responseJSON.items});
		}).catch(error => {
			console.log('ERROR');
			console.log(error);
		});
	}

	render() {
		return (
			<div className={'github-wrapper pt-card pt-elevation-2'}>
				<div className={'github-edit'}>
					<div>{this.props.url}</div>
					{this.props.isSelected &&
					<div className={'github-search'}>
						<div className={'github-search-input pt-input-group'}>
							<span
								className={`pt-icon pt-icon-search`}
								onClick={this.searchGitHub} />
							<input
								type="search"
								placeholder={'Enter GitHub repo name or url'}
								className={'pt-input pt-fill'}
								value={this.state.searchText}
								onChange={this.handleValueChange} />
						</div>
						<ul className={'github-search-list'}>
							{this.state.repoList.map((repo) => {
								return (
									<li key={repo.id} onClick={this.handleRepoSelect} data-url={repo.html_url}>
										{repo.full_name} ({repo.html_url})
									</li>
								);
							})}
						</ul>
					</div>
					}
				</div>
			</div>
		);
	}
}

GitHubEditable.propTypes = propTypes;
GitHubEditable.defaultProps = defaultProps;
export default GitHubEditable;
