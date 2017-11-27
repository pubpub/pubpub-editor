import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GitHubEditable from './GitHubEditable';
import GitHubStatic from './GitHubStatic';

const propTypes = {
	handleRepoSelect: PropTypes.func
};
const defaultProps = {
	handleRepoSelect: ()=>{

	}
};

/**
* @module Addons
*/

/**
* @component
*
* Embed GitHub repo in your document.
*
* @prop {function} handleFileUpload(file,onProgressCallback,onFinishCallback,index) A function that uploads the given file and is expected to call onFinishCallback with a new URL where the file is accessible.
* @prop {function} handleResizeUrl(url) A function that takes a URL and returns a new URL that will be rendered. Allows you to use a resizing service.
*
* @example
return (
	<Editor>
 		<Image
 			handleFileUpload={myUploadFunc}
 			handleResizeUrl={myResizeFunc}
 		/>
	</Editor>
);
*/
class GitHub extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				github: {
					atom: true,
					attrs: {
						url: { default: '' }
					},
					parseDOM: [{
						tag: 'github',
						getAttrs: (node)=> {
							return {
								url: node.getAttribute('data-url') || ''
							};
						}
					}],
					toDOM: (node)=> {
						return ['github', {
							'data-url': node.attrs.url
						}];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert GitHub Link',
						icon: 'pt-icon-git-repo',
						onInsert: (view) => {
							const githubNode = view.state.schema.nodes.github.create();
							const transaction = view.state.tr.replaceSelectionWith(githubNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<GitHubEditable
								url={node.attrs.url}
								isSelected={isSelected}
								{...helperFunctions}
							/>
						);
					},
					toStatic(node) {
						return (
							<GitHubStatic
								url={node.attrs.url}
							/>
						);
					},
				},
			}
		};
	};

	render() {
		return null;
	}
}

GitHub.propTypes = propTypes;
GitHub.defaultProps = defaultProps;
export default GitHub;
