import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VideoEditable from './VideoEditable';
import VideoStatic from './VideoStatic';

const propTypes = {
	handleFileUpload: PropTypes.func,
};
const defaultProps = {
	handleFileUpload: ()=>{},
};

/**
 * @module Addons
 */

/**
 * @component
 *
 * Embed videos in your document. Supports .webm and .mp4 files.
 * @prop {function} handleFileUpload(file,onProgressCallback,onFinishCallback,index) A function that uploads the given file and is expected to call onFinishCallback with a new URL where the file is accessible.
 * @example
 * return (
	<Editor>
 		<Video handleFileUpload={myUploadFunc} />
	</Editor>
);
*/
class Video extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				video: {
					atom: true,
					// content: 'inline*',
					attrs: {
						url: { default: null },
						size: { default: 50 }, // number as percentage
						align: { default: 'center' },
						caption: { default: '' },
					},
					parseDOM: [{
						tag: 'video',
						getAttrs: (node)=> {
							return {
								url: node.getAttribute('src') || null,
								size: Number(node.getAttribute('data-size')) || 50,
								align: node.getAttribute('data-align') || 'center',
								caption: node.getAttribute('alt') || '',
							};
						}
					}],
					toDOM: (node)=> {
						return ['video', {
							src: node.attrs.url,
							'data-size': node.attrs.size,
							'data-align': node.attrs.align,
							alt: node.attrs.caption,
						}];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert Video',
						icon: 'pt-icon-video',
						onInsert: (view) => {
							const videoNode = view.state.schema.nodes.video.create();
							const transaction = view.state.tr.replaceSelectionWith(videoNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<VideoEditable
								node={node}
								caption={node.attrs.caption}
								url={node.attrs.url}
								align={node.attrs.align}
								size={node.attrs.size}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
								onFileUpload={props.handleFileUpload}
							/>
						);
					},
					toStatic(node) {
						return (
							<VideoStatic
								align={node.attrs.align}
								url={node.attrs.url}
								size={node.attrs.size}
								caption={node.attrs.caption}
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

Video.propTypes = propTypes;
Video.defaultProps = defaultProps;
export default Video;
