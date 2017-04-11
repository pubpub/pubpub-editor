import { Button, EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import Radium, {Style} from 'radium';
import React, {PropTypes} from 'react';

import ReactDOM from 'react-dom';

let styles = {};

export const IframeComponent = React.createClass({
	propTypes: {
		url: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
	},
	getInitialState: function() {
		return {
      editing: false,
		};
	},
	getDefaultProps: function() {
		return {
			context: 'document',
		};
	},

  changeToEditing: function() {
    const clientWidth =  ReactDOM.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
    this.setState({editing: true, clientWidth});
    setTimeout(() => this.refs.input.focus(), 10);
  },

  changeToNormal: function() {
    const displayHTML= this.generateHTML(this.props.value);
    this.setState({editing: false, displayHTML});
  },

  handleChange: function(event) {
    const value = event.target.value;
    // this.setState({value});
    this.props.updateValue(value);
  },

  handleKeyPress: function(e) {
     if (e.key === 'Enter' && !this.props.block) {
       this.changeToNormal();
     }
  },

	setSelected: function(selected) {
		this.setState({selected});
	},

  renderDisplay() {
    const {displayHTML, selected, closePopOver} = this.state;
    const {value, block} = this.props;


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
      <span style={styles.display({block, selected})}>
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
						className={'pub-embed-latex'}
	          dangerouslySetInnerHTML={{__html: displayHTML}}
	          style={styles.output}>
	        </div>
				:
					<span
						ref={'latexElem'}
						className={'pub-embed-latex'}
	          dangerouslySetInnerHTML={{__html: displayHTML}}
	          style={styles.output}>
	        </span>
				}
				</Popover>
      </span>
    );
  },

  renderEdit() {
    const {clientWidth} = this.state;
    const {value, block} = this.props;

		const popoverContent = (<div>
			<Button iconName="annotation" onClick={this.changeToNormal}>Save</Button>
		</div>);

    return (
      <span style={{position: 'relative'}}>

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
				<div className="pt-input-group">
						<span className="pt-icon pt-icon-function"></span>
						 <input
								ref="input"
								type="text"
								className="pt-input"
								placeholder="Enter equation..."
								onChange={this.handleChange}
								onKeyPress={this.handleKeyPress}
								value={value} />
				</div>
			}
      </span>
    );
  },


	render: function() {
    const {editing} = this.state;
    return <div>Editing iframes not supported yet.</div>
	}
});

styles = {
  wrapper: {
    backgroundColor: 'blue',
  },
  block: {
    position: 'absolute',
    left: '0px',
    fontSize: '15px',
    border: '1px solid black',
    borderRadius: '1px',
    width: '100px',
    height: '25px',
    lineHeight: '25px',
    width: 'auto',
    padding: '3px 6px',
    marginTop: '5px',
    cursor: 'pointer',
  },
  display: function({block, selected})  {
    return {
			outline: (selected) ? '2px solid #BBBDC0' : '2px solid transparent',
      fontSize: (block) ? '20px' : '0.9em',
    };
  },
  editing: function({clientWidth}) {
    return {
      display: 'inline',
      width: Math.round(clientWidth),
      minWidth: '100px',
      fontSize: '1em',
      margin: '0px',
      padding: '0px',
      lineHeight: '1em',
      border: 'none',
      outline: '2px solid #BBBDC0',
      borderRadius: 'none',
    }
  },
};

export default IframeComponent;
