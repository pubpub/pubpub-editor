import React, {PropTypes} from 'react';

let styles = {};

// citations HTML..

export const CitationsRender = React.createClass({
	propTypes: {
		citations: PropTypes.array,
	},
	getInitialState: function() {
    return {editing: true};
	},

	setSelected: function(selected) {
		this.setState({selected});
	},

  renderDisplay() {
		const { renderedBib } = this.props;
		let hideCitations = !(renderedBib && renderedBib.length > 0);

    return (
      <div>
				{(!hideCitations) ?
					<div>
		        <h3>Citations: </h3>
						{renderedBib.map((bibItem, index) => {
							return <div key={index} dangerouslySetInnerHTML={{__html:bibItem.text}}></div>
						})}
					</div>
					:
					null
				}
      </div>
    );
  },




  render: function() {
    const {editing} = this.state;
		return this.renderDisplay();
	}
});

styles = {
  wrapper: {
    backgroundColor: 'blue',
  },
  editing: function({clientWidth}) {
    return {
      display: 'inline',
      minWidth: '100px',
      fontSize: '12px',
      margin: '0px',
      padding: '0px',
      lineHeight: '1em',
      border: '2px solid #BBBDC0',
      borderRadius: '2px',
    }
  },
};

export default CitationsRender;
