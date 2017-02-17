import { Button, EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import Radium, {Style} from 'radium';
import React, {PropTypes} from 'react';

import ReactDOM from 'react-dom';
import katex from 'katex';
import katexStyles from './katex.css.js';

// import {safeGetInToJS} from 'utils/safeParse';

const ERROR_MSG_HTML = "<div class='pub-latex-error'>Error rendering equation</div>";

export const LatexEditor = React.createClass({
	propTypes: {
		value: PropTypes.string,
    block: PropTypes.bool,
    updateValue: PropTypes.func,
    changeToBlock: PropTypes.func,
    changeToInline: PropTypes.func,
	},
	getInitialState: function() {
		const displayHTML = this.generateHTML(this.props.value);
		return {
      editing: false,
      displayHTML,
			value: null,
		};
	},
	getDefaultProps: function() {
		return { };
	},

	componentWillReceiveProps: function(nextProps) {
		if (this.props.block !== nextProps.block) {
			this.setState({closePopOver: false});
		}
    if (this.props.value !== nextProps.value) {
      const text = nextProps.value;
      if (!this.state.editing) {
        const displayHTML= this.generateHTML(text);
        this.setState({displayHTML});
      }
    }
	},

	forceSelection: function() {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
	},

  changeToEditing: function() {
    const clientWidth =  ReactDOM.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
    this.setState({editing: true, clientWidth});
    setTimeout(() => this.refs.input.focus(), 10);
  },

  changeToNormal: function() {
		const value = this.state.value || this.props.value;
    const displayHTML= this.generateHTML(value);
		this.props.updateValue(value);
    this.setState({editing: false, displayHTML, value: null});
  },

  handleChange: function(event) {
    const value = event.target.value;
    this.setState({value});
		this.forceUpdate();
    // this.props.updateValue(value);
  },

  generateHTML(text) {
		try {
			return katex.renderToString(text, {displayMode: this.props.block});
		} catch (err) {
			return ERROR_MSG_HTML;
		}
  },

  handleKeyPress: function(e) {
     if (e.key === 'Enter' && !this.props.block) {
       this.changeToNormal();
     }
  },

	setSelected: function(selected) {
		this.setState({selected});
	},

	changeToInline: function() {
		this.setState({closePopOver: true});
		this.props.changeToInline();
	},

	changeToBlock: function() {
		this.setState({closePopOver: true});
		this.props.changeToBlock();
	},

  renderDisplay() {
    const {displayHTML, selected, closePopOver} = this.state;
    const {block, value} = this.props;

		const popoverContent = (<div className="pt-button-group pt-fill">
			<Button iconName="annotation" onClick={this.changeToEditing}>Edit</Button>
			{(!block) ?
				<Button iconName="maximize" onClick={this.changeToBlock}>Block</Button>
				:
				<Button iconName="minimize" onClick={this.changeToInline}>Inline</Button>
			}

		</div>);

		const isPopOverOpen = (closePopOver) ? false : undefined;

    return (
      <span onClick={this.forceSelection}>
        <Style rules={ katexStyles } />
					<Popover content={popoverContent}
									 isOpen={isPopOverOpen}
									 interactionKind={PopoverInteractionKind.CLICK}
									 popoverClassName="pt-popover-content-sizing"
									 position={Position.BOTTOM}
									 useSmartPositioning={false}>
				{(block) ?
					<div
						ref={'latexElem'}
						className={'pub-latex pub-latex-block'}
	          dangerouslySetInnerHTML={{__html: displayHTML}}>
	        </div>
				:
					<span
						ref={'latexElem'}
						className={'pub-latex'}
	          dangerouslySetInnerHTML={{__html: displayHTML}}>
	        </span>
				}
				</Popover>
      </span>
    );
  },

  renderEdit() {
    const {clientWidth} = this.state;
    const {block} = this.props;

		const value = this.state.value || this.props.value;

		const popoverContent = (<div>
			<Button iconName="annotation" onClick={this.changeToNormal}>Save</Button>
		</div>);

    return (
      <span style={{position: 'relative'}} onClick={this.forceSelection}>

				{(block) ?
					<Popover content={popoverContent}
									 defaultIsOpen={true}
									 interactionKind={PopoverInteractionKind.CLICK}
									 popoverClassName="pt-popover-content-sizing"
									 position={Position.BOTTOM}
									 autoFocus={false}
									 enforceFocus={false}
									 useSmartPositioning={false}>
									 <div className="pt-input-group">
									   <span className="pt-icon pt-icon-function"></span>
											 <textarea
							 					ref="input"
							 					type="text"
							 					className="pt-input"
							 					placeholder="Enter equation..."
							 					onChange={this.handleChange}
							 					value={value} >
							 				</textarea>
								 </div>
				</Popover>
				:
				<span>
						<span className="pt-icon pt-icon-function"></span>
						 <input
								ref="input"
								type="text"
								className="pt-input"
								placeholder="Enter equation..."
								onChange={this.handleChange}
								onKeyPress={this.handleKeyPress}
								style={{width: 'auto'}}
								value={value} />
				</span>
			}
      </span>
    );
  },


	render: function() {
    const {editing} = this.state;
    if (editing) {
      return this.renderEdit();
    }
		return this.renderDisplay();
	}
});


export default LatexEditor;
