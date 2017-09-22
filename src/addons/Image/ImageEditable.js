import { EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Fragment, Slice } from 'prosemirror-model';
import React, { Component } from 'react';

import ImageFileUploader from './ImageFileUploader';
import ImageMenu from './ImageMenu';
import { NodeSelection } from 'prosemirror-state';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Resizable from 're-resizable';

let styles = {};

const propTypes = {
	url: PropTypes.string,
	align: PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word', 'max']),
	size: PropTypes.string,
	updateAttrs: PropTypes.func,
};

class ImageEditable extends Component {


	constructor(props) {
		super(props);
		this.state = {
			openDialog: false
		};
	}

	getSize = () => {
		const elem = ReactDOM.findDOMNode(this.refs.menupointer);
		return {
			width: elem.clientWidth,
			left: elem.offsetLeft,
			top: elem.offsetTop,
		};
	}

	setCiteCount = (citeCount) => {
		this.setState({citeCount});
		this.forceUpdate();
	}

	updateAttrs = (newAttrs) => {
		this.props.updateAttrs(newAttrs);
	}

	updateCaption = (val) => {
		if (!val) {
			this.props.removeCaption();
			return;
		}
		this.props.updateCaption(val);
	}

	forceSelection = (evt) => {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
		evt.preventDefault();
	}

	createCaption = () => {
		// Need to check if caption already exists?
		const view = this.props.view;
		const from = this.props.getPos() + 1;
		const textnode = view.state.schema.text('Enter caption');
		const captionNode = view.state.schema.nodes.caption.create({}, textnode);
		const transaction = view.state.tr.insert(from, captionNode);
		view.dispatch(transaction);
	}

	removeCaption = () => {
		const view = this.props.view;

		let textNode = this.getTextNode();
		if (!textNode) {
			console.log('could not find textNode');
			return;
		}
		const from = textNode.from - 1;
		const to = textNode.to;
		const checkSlice = view.state.doc.slice(from, to);
		const transaction = view.state.tr.deleteRange(from, to);
		view.dispatch(transaction);
	}

	getTextNode = () => {
		// let textNode = findNodesWithIndex(this.node, 'text');
		const contentNode = this.props.node.content;
		const hasCaption = (contentNode && contentNode.content && contentNode.content.length > 0);
		const textNode = (hasCaption) ? contentNode.content[0].content.content[0] : null;
		if (!textNode) {
			console.log('could not find textnode', this.node);
			return null;
		}
		const from = this.props.getPos() + 3;
		const to = from + textNode.nodeSize;
		return {from, to};
	}

	updateCaption = (txt) => {
		const view = this.props.view;
		let textNode = this.getTextNode();

		if (!textNode) {
			console.log('could not find textNode');
			return;
		}

		const slice = new Slice(Fragment.from(view.state.schema.text(txt)), 0, 0);
		const transaction = view.state.tr.replaceRange(textNode.from, textNode.to, slice);
		view.dispatch(transaction);
	}

	openFileDialog = () => {
		this.setState({ openDialog: true });
	}

	closeFileDialog = () => {
		this.setState({ openDialog: false });
	}

	onFileSelect = (evt) => {
		// Need to upload file
		// Need to add new file object to file list
		// Need to insert file content into editor
		const file = evt.target.files[0];
		evt.target.value = null;
		this.props.handleFileUpload(file, ()=> {}, ({ filename, url })=>{
			this.props.updateAttrs({ url });
			this.setState({
				openDialog: false,
				callback: undefined,
			});
		});
	}

	render() {
		const { size, align, selected, url, caption } = this.props;

		const popoverContent = (<ImageMenu align={align} createCaption={this.createCaption} removeCaption={this.removeCaption} embedAttrs={this.props} updateParams={this.updateAttrs}/>);

		const maxImageWidth = document.querySelector(".pubpub-editor").clientWidth;
		// const maxImageWidth = 600;
		return (
			<div
				draggable="false"
				className="pub-embed"
				ref="embedroot"
				>

				<ImageFileUploader
					isOpen={!!this.state.openDialog}
					onClose={this.closeFileDialog}
					onFileSelect={this.onFileSelect} />

				<figure style={styles.figure({size, align, selected: false})}>

					<div style={styles.row({size, align})}>
						<Popover content={popoverContent}
							interactionKind={PopoverInteractionKind.CLICK}
							popoverClassName="pt-popover-content-sizing pt-minimal pt-dark"
							position={Position.BOTTOM}
							autoFocus={false}
							popoverWillOpen={(evt) => {
								this.refs.embedroot.focus();
							}}
							useSmartPositioning={false}>

							{ (!!url) ?
								(align !== 'max') ?
								<Resizable
									height="auto"
									ref={c => { this.resizable = c; }}
									maxWidth={maxImageWidth}
									customStyle={styles.outline({selected})}
									minWidth={(align === 'max') ? '100%' : undefined}
									onResizeStop={(event, direction, ref, delta) => {
										const docWidth = document.querySelector(".pubpub-editor").clientWidth;
										const clientWidth = this.resizable.state.width;
										const ratio = ((clientWidth / docWidth ) * 100).toFixed(1);
										this.props.updateAttrs({size: ratio + '%' });
									}}>
									<img onDoubleClick={this.openFileDialog} style={styles.image({selected})} src={url}/>
								</Resizable>
								:
								<img onDoubleClick={this.openFileDialog} style={styles.image({selected})}  src={url}/>
								:
								<div onDoubleClick={this.openFileDialog}  style={styles.container({selected})}>
								</div>
							}
						</Popover>
					</div>
					<figcaption style={styles.caption({size, align})}>
						{(this.props.caption) ?
							<EditableText
								className="pub-caption"
								ref="captionArea"
								maxLines={5}
								minLines={1}
								multiline
								confirmOnEnterKey
								placeholder="Edit caption"
								defaultValue={caption}
								onConfirm={this.updateCaption}
							/>
							: null}
						</figcaption>
					</figure>
				</div>
			);
		}
	}

	styles = {
		row: function ({ size, align }) {
			return {
				width: (align !== 'max') ? size : '100%',
				position: 'relative',
				display: 'table-row'
			};
		},
		container: function({ selected }) {
			return {
				minHeight: '250',
				minWidth: '250',
				width: '100%',
				outline: (selected) ? '3px dashed #BBBDC0' : '1px dashed #BBBDC0',
				transition: 'outline-color 0.15s ease-in',
			};
		},
		image: function({ selected }) {
			return {
				width: '100%',
				outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
				transition: 'outline-color 0.15s ease-in',
			};
		},
		outline: function({selected}) {
			return {
				outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
				transition: 'outline-color 0.15s ease-in',
				paddingTop: '10px',

			};
		},
		figure: function({ size, align, selected }) {
			const style = {
				width: (!!size) ? size : 'auto',
				display: 'table',
				outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
				transition: 'outline-color 0.15s ease-in',
				paddingTop: '10px',
				marginRight: (align === 'left') ? '20px' : null,
				marginLeft: (align === 'right') ? '20px' : null,
			};
			if (align === 'max') {
				style.width = 'calc(100% + 30px)';
				style.margin = '0 0 0 -15px';
			} else if (align === 'left') {
				style.float = 'left';
			} else if (align === 'right') {
				style.float = 'right';
			} else if (align === 'full' || !align) {
				style.margin = '0 auto';
			}
			return style;
		},
		caption: function({size, align}) {
			const style = {
				lineHeight: '30px',
				fontSize: '1em',
				width: size,
				display: 'table-row',
			};
			return style;
		}
	};

	export default ImageEditable;
