import { EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, {PropTypes} from 'react';
import { RenderFile, URLToType } from '@pubpub/render-files';

import EmbedMenu from './embedMenu';
import ReactDOM from 'react-dom';
import Resizable from 'react-resizable-box';

let styles = {};

export const EmbedComponent = React.createClass({
	propTypes: {
		url: PropTypes.string,
		align: PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word', 'max']),
		size: PropTypes.string,
    updateAttrs: PropTypes.func,
	},
	getInitialState: function() {
		return {
			selected: false,
		};
	},
	getDefaultProps: function() {
		return {
		};
	},

	getSize: function() {
		const elem = ReactDOM.findDOMNode(this.refs.menupointer);
		return {
			width: elem.clientWidth,
			left: elem.offsetLeft,
			top: elem.offsetTop,
		};
	},

	setCiteCount: function(citeCount) {
		this.setState({citeCount});
		this.forceUpdate();
	},

	setSelected: function(selected) {
		this.setState({selected});
	},

	focusAndSelect: function() {
		this.setState({selected: true});
		this.refs.embedroot.focus();
	},

	updateAttrs: function(newAttrs) {
		this.props.updateAttrs(newAttrs);
	},

	getInsert: function() {
		return this.refs.captioninsert;
	},


	updateCaption: function(val) {
		if (!val) {
			this.props.removeCaption();
			return;
		}
		this.props.updateCaption(val);
	},

	forceSelection: function(evt) {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
		evt.preventDefault();
	},

	render: function() {
		const {size, align, url, filename} = this.props;
		const {selected} = this.state;
		const caption = (this.state.caption || this.props.caption);
		const data = this.props.data || {};
		const file = {url, name: filename, type: URLToType(url)}

		const popoverContent = (<EmbedMenu align={align} createCaption={this.props.createCaption} removeCaption={this.props.removeCaption} embedAttrs={this.props} updateParams={this.updateAttrs}/>);

		const maxImageWidth = document.querySelector(".pub-body").clientWidth;

		return (
			<div draggable="false" ref="embedroot" className="pub-embed" onClick={this.forceSelection}>
				<figure style={styles.figure({size, align, false})}>
				<div style={styles.row({size, align})}>
				<Popover content={popoverContent}
								 interactionKind={PopoverInteractionKind.CLICK}
								 popoverClassName="pt-popover-content-sizing pt-minimal pt-dark"
								 position={Position.BOTTOM}
								 autoFocus={false}
								 popoverWillOpen={(evt) => {
									 // returns focus to the image so that deleting the embed will work
									 this.refs.embedroot.focus();
								 }}
								 useSmartPositioning={false}>

				{ (!!url) ?
					(align !== 'max') ?
					<Resizable
						width={'100%'}
						height={'auto'}
						maxWidth={maxImageWidth}
						customStyle={styles.outline({false})}
						enable={false}
						minWidth={(align === 'max') ? '100%' : undefined}
						onResizeStop={(direction, styleSize, clientSize, delta) => {
							// const ratio = ((clientSize.width / this.DOC_WIDTH ) * 100).toFixed(1);
							// const ratio = ((clientSize.width / this.DOC_WIDTH ) * 100);
							// this.updateAttrs({size: ratio + '%' });
							// get width and scale?

							const docWidth = document.querySelector(".pub-body").clientWidth;
							const ratio = ((clientSize.width / docWidth ) * 100).toFixed(1);
							this.updateAttrs({size: ratio + '%' });
							// this.updateAttrs({size: clientSize.width + 'px' });
						}}>
						<RenderFile draggable="false" style={styles.image({selected})} file={file}/>
						</Resizable>
						:
						<RenderFile draggable="false" style={styles.image({selected})} file={file}/>
					:
					<div className="pt-callout pt-intent-danger">
					  <h5>Could not find file: {filename}</h5>
					  The file you're including is not uploaded to your pub, so it cannot be displayed.
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
});

styles = {
	row: function ({ size, align }) {
		return {
			width: (align !== 'max') ? size : '100%',
			position: 'relative',
			display: 'table-row'
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

export default EmbedComponent;
