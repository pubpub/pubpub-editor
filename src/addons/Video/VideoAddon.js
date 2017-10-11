import React, { Component } from 'react';
import PropTypes from 'prop-types';
import VideoEditable from './VideoEditable';
import VideoStatic from './VideoStatic';

const propTypes = {
	handleFileUpload: PropTypes.func,

	/* All addons get the following props,
	but certain schema-based addons may not need them */
	// containerId: PropTypes.string.isRequired,
	// view: PropTypes.object.isRequired,
	// editorState: PropTypes.object.isRequired,
};
const defaultProps = {
	handleFileUpload: ()=>{},
};

class VideoAddon extends Component {
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
					parseDOM: [{ tag: 'video[src]' }],
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

VideoAddon.propTypes = propTypes;
VideoAddon.defaultProps = defaultProps;
export default VideoAddon;
