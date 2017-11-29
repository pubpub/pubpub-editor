import React, { Component } from 'react';
import PropTypes from 'prop-types';

require('./gitHub.scss');

const propTypes = {
	isSelected: PropTypes.bool,
	updateAttrs: PropTypes.func.isRequired,
	url: PropTypes.string
};

const defaultProps = {
	isSelected: false,
	url: ''
};

class GitHubEditable extends Component {
	static cleanSearchText(searchText) {
        // remove beginning/ending whitespace
        let cleanedSearchText = searchText.trim();

        // remove remaining multiple whitespaces
        cleanedSearchText = cleanedSearchText.replace(/\s+/g, ' ');

        return cleanedSearchText;
	}

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
		this.props.updateAttrs({ url: evt.target.getAttribute('data-url') });
	}

	handleValueChange(evt) {
		this.setState({ searchText: evt.target.value });

		clearTimeout(this.typeAhead);

		this.typeAhead = setTimeout(() => {
			this.searchGitHub();
		}, 500);
	}

	searchGitHub() {
		const searchText = GitHubEditable.cleanSearchText(this.state.searchText);

		if (searchText === '') {
			return;
		}

		window.fetch('https://api.github.com/search/repositories?q='+ this.state.searchText).then((response) => {
			if (response.ok) {
				return response.json();
			}

			throw new Error('error fetching from GitHub');
		}).then((responseJSON) => {
			this.setState({ repoList: responseJSON.items });
		}).catch((error) => {
			console.log('ERROR');
			console.log(error);
		});
	}

	render() {
		return (
			<div className="github-wrapper pt-card pt-elevation-2">
				<div className={`github-edit ${this.props.isSelected ? 'isSelected' : ''}`}>
				{!this.props.url && !this.props.isSelected &&
					<div>Click to insert GitHub repo</div>
				}
				{this.props.url &&
					<div>{this.props.url}</div>
				}
				{this.props.isSelected &&
					<div className="github-search">
						<div className="github-search-input pt-input-group">
							<span
								className="pt-icon pt-icon-search"
								onClick={this.searchGitHub} />
							<input
								type="search"
								placeholder="Enter GitHub repo name or url to search for"
								className="pt-input pt-fill"
								value={this.state.searchText}
								onChange={this.handleValueChange} />
						</div>
						<ul className="github-search-list">
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
