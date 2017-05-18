import React, {PropTypes} from 'react';

export const CitationsRender = React.createClass({
	propTypes: {
		citations: PropTypes.array,
	},
	getInitialState: function() {
    return {};
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
							return <div key={index} style={{paddingBottom: 10}} dangerouslySetInnerHTML={{__html:bibItem.text}}></div>
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

export default CitationsRender;
