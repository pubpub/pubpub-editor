import { Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { Component } from 'react';
import { Plugin, PluginKey } from 'prosemirror-state';
import getMenuItems, { canUseInsertMenu, insertEmbed, insertReference } from './insertMenuConfig';
import PropTypes from 'prop-types';

const insertMenuKey = new PluginKey('insert-menu');

let styles;

const propTypes = {
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};


class InsertMenu extends Component {
	static getPlugins(props) {
		return [new Plugin({
			key: insertMenuKey,
			state: {
				init(config) {
					return {
						isActive: false,
						top: 0,
						left: 0,
						opacity: 0,
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					// const { view, containerId } = this.props;

					// const container = document.getElementById(props.containerId);
					const canUse = canUseInsertMenu(editorState);
					const sel = editorState.selection;
					const currentPos = sel.$to;

					if (sel.empty && canUse) {
						const currentNode = editorState.doc.nodeAt(currentPos.pos - 1);

						let isActive;
						let start;
						let end;
						if (currentNode && currentNode.text) {
							const currentLine = currentNode.text.replace(/\s/g, ' ');
							let parentOffset = currentPos.parentOffset;
							// sometimes the parent offset may not be describing the offset into the text node
							// if so, we need to correct for this.
							if (currentNode !== currentPos.parent) {
								const child = currentPos.parent.childAfter(currentPos.parentOffset - 1);
								if (child.node === currentNode) {
									parentOffset -= child.offset;
								}
							}
							const nextChIndex = parentOffset;
							const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
							const prevChars = currentLine.substring(0, parentOffset);
							const startIndex = prevChars.lastIndexOf(' ') + 1;
							const startLetter = currentLine.charAt(startIndex);
							isActive = startLetter === '/' && nextCh.charCodeAt(0) === 32;
							const substring = currentLine.substring(startIndex + 1, nextChIndex) || ' ';
							start = currentPos.pos - parentOffset + startIndex;
							end = currentPos.pos - parentOffset + startIndex + 1 + substring.length;
						}

						return {
							isActive: isActive,
							start: start,
							end: end,
							positionNumber: currentPos.pos,
							parentOffset: sel.$to.parentOffset,
							hasTop: true,
						};
					}

					return {
						isActive: false,
						positionNumber: currentPos.pos,
						hasTop: false,
					};





						// this.setState({
						// 	top: view.coordsAtPos(currentPos.pos).top - container.getBoundingClientRect().top,
						// 	left: view.coordsAtPos(currentPos.pos).left - container.getBoundingClientRect().left,
						// 	opacity: sel.$to.parentOffset === 0 ? 0.5 : 0.1,
					// return {
					// 	isActive: false,
					// 	top: 0,
					// };
				},
			},
			props: {
				handleDOMEvents: {
					keydown: (view, evt)=> {

						const state = view.state['insert-menu$'];
						console.log('Got a formatting key', evt.type);
						if (state.isActive && evt.type === 'keydown' && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || evt.key === 'Enter')) {
							// const pluginState = getPluginState('mentions', view.state);
							// if (pluginState.start !== null) {
							evt.preventDefault();
							return true;
							// }
						}
						return false;
					},
				},
			}
		})];
	}
	constructor(props) {
		super(props);

		this.state = {
			openDialog: undefined,
			callback: undefined,
			top: null,
			left: null,
			expanded: false,

		};
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}
	}

	onChange = () => {
		const { view, containerId } = this.props;

		console.log('In onchange', insertMenuKey.getState(view.state));
		const container = document.getElementById(containerId);
		// const canUse = canUseInsertMenu(view);
		// const sel = view.state.selection;
		// const currentPos = sel.$to;

		
		const viewState = insertMenuKey.getState(view.state);
		this.setState({
			isActive: viewState.isActive,
			start: viewState.start,
			end: viewState.end,
			opacity: viewState.parentOffset === 0 ? 0.5 : 0.1,
			top: view.coordsAtPos(viewState.positionNumber).top - container.getBoundingClientRect().top,
			left: view.coordsAtPos(viewState.positionNumber).left - container.getBoundingClientRect().left,
		});


		// if (sel.empty && canUse) {

		// 	// const currentNode = view.state.doc.nodeAt(currentPos.pos - 1);
		// 	const currentNode = view.state.doc.nodeAt(currentPos.pos - 1);


		// 	let isActive;
		// 	let start;
		// 	let end;
		// 	if (currentNode && currentNode.text) {
		// 		const currentLine = currentNode.text.replace(/\s/g, ' ');
		// 		console.log('CurrentLine is', currentLine);
		// 		let parentOffset = currentPos.parentOffset;
		// 		console.log('parentOffset is', parentOffset);
		// 		// sometimes the parent offset may not be describing the offset into the text node
		// 		// if so, we need to correct for this.
		// 		if (currentNode !== currentPos.parent) {
		// 			const child = currentPos.parent.childAfter(currentPos.parentOffset - 1);
		// 			if (child.node === currentNode) {
		// 				parentOffset -= child.offset;
		// 			}
		// 		}
		// 		const nextChIndex = parentOffset;
		// 		const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
		// 		console.log('nextCh is', nextCh);
		// 		const prevChars = currentLine.substring(0, parentOffset);
		// 		console.log('prevChars is', currentLine);
		// 		const startIndex = prevChars.lastIndexOf(' ') + 1;
		// 		const startLetter = currentLine.charAt(startIndex);
		// 		console.log('startLetter is', startLetter);
		// 		isActive = startLetter === '/' && nextCh.charCodeAt(0) === 32;
		// 		const substring = currentLine.substring(startIndex + 1, nextChIndex) || ' ';
		// 		start = currentPos.pos - parentOffset + startIndex;
		// 		end = currentPos.pos - parentOffset + startIndex + 1 + substring.length;

		// 	}





		// 	this.setState({
		// 		top: view.coordsAtPos(currentPos.pos).top - container.getBoundingClientRect().top,
		// 		left: view.coordsAtPos(currentPos.pos).left - container.getBoundingClientRect().left,
		// 		opacity: sel.$to.parentOffset === 0 ? 0.5 : 0.1,
		// 		expanded: isActive,
		// 		start: start,
		// 		end: end,
		// 	});
		// 	console.log({
		// 		top: view.coordsAtPos(currentPos.pos).top - container.getBoundingClientRect().top,
		// 		left: view.coordsAtPos(currentPos.pos).left - container.getBoundingClientRect().left,
		// 	})
		// } else {
		// 	this.setState({
		// 		top: null,
		// 		expanded: false,
		// 		start: 0,
		// 		end: 0,
		// 	});
			
		// }
	}

	openDialog = (dialogType, callback) => {
		this.setState({
			openDialog: dialogType,
			callback: callback
		});
	}

	closeDialog = () => {
		this.setState({
			openDialog: undefined,
			callback: undefined,
		});
	}

	onFileSelect = (evt) => {
		// Need to upload file
		// Need to add new file object to file list
		// Need to insert file content into editor
		const file = evt.target.files[0];
		evt.target.value = null;
		this.props.handleFileUpload(file, (filename, url)=>{
			// insertEmbed(filename);
			this.state.callback(filename, url); // This shouldn't use the callback - it should import the function rom insertMenu and call it.

			this.setState({
				openDialog: undefined,
				callback: undefined,
			});
		});
	}

	onReferenceAdd = (item) => {
		// Need to update or create bibtex file
		// Need to make sure that updated file is sent to editor props
		// Need to call inserReference function

		const existingReference = this.props.allReferences.find((reference) => {
			if (reference.id === item.id) {
				return true;
			}
			return false;
		});


		if (existingReference) {
			this.state.callback(item);
			this.setState({
				openDialog: undefined,
				callback: undefined,
			});
			return;
		}

		this.props.handleReferenceAdd(item, (itemToAdd)=> {
			this.setState({
				openDialog: undefined,
				callback: undefined,
			});
			this.state.callback(itemToAdd);
		});

	}
	replaceContent = ()=> {
		const transaction = this.props.view.state.tr.replaceRangeWith(this.state.start, this.state.end, 'yo');
		return this.props.view.dispatch(transaction);
	}

	render() {
		const { view } = this.props;
		const { top, opacity, left, isActive } = this.state;

		const menuItems = getMenuItems(view, this.openDialog);

		if (top === null) {
			return null;
		}

		return (
			<div style={styles.container(top, opacity, left)} className={'insert-menu'}>
				<span className={'NEEDS-POINTER-EVENTS-NONE'}>Type / to insert...</span>
				{isActive &&
					<div onClick={this.replaceContent}>Kittens!</div>
				}
				{/*<Popover
					content={
						<Menu>
							{menuItems.map((item, index)=> {
								return <MenuItem key={`insert-menu-${index}`} onClick={item.run} text={item.text} />;
							})}
						</Menu>
					}
					interactionKind={PopoverInteractionKind.CLICK}
					popoverClassName="pt-minimal pt-popover-dismiss"
					position={Position.BOTTOM_LEFT}
					inline={true}
					useSmartPositioning={false}>
					<button className={'pt-button pt-minimal pt-icon-insert'} />
				</Popover>*/}

				{/*
				<InsertMenuDialogReferences
					isOpen={this.state.openDialog === 'references'}
					onClose={this.closeDialog}
					onReferenceAdd={this.onReferenceAdd} />
					*/}
			</div>
		);
	}

}

export default InsertMenu;

styles = {
	container: function(top, opacity, left) {
		return {
			position: 'absolute',
			left: `${left + 2}px`,
			top: top,
			opacity: opacity,
		};
	},
};
