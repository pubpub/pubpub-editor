import React, {PropTypes} from 'react';

let styles = {};

export const CitationsComponent = React.createClass({
	propTypes: {
		value: PropTypes.string,
    block: PropTypes.bool,
    updateValue: PropTypes.func,
    changeToBlock: PropTypes.func,
    changeToInline: PropTypes.func,
	},
	getInitialState: function() {
    return {editing: true};
	},

  /*
	componentWillReceiveProps: function(nextProps) {
    if (this.props.value !== nextProps.value) {
      const text = nextProps.value;
      // Search for new plugins
    }
	},
  */

	setSelected: function(selected) {
		this.setState({selected});
	},

	preventClick: function(evt) {
		evt.preventDefault();
	},

  renderDisplay() {
		const { citations } = this.props;
		const citationData = citations.map((citation) => citation.data);
		const citationIDs = citations.map((citation) => citation.citationID).filter((citationID) => !!citationID);

		const bib = this.props.getBibliography(citationData, citationIDs);
		// console.log('Got bib!', bib, citations);
		let hideCitations = !(bib && bib.length > 0);
    return (
      <div className="pub-citations" onClick={this.preventClick}>
				{(!hideCitations) ?
					<div>
		        <h3>Citations: </h3>
						{bib.map((bibItem) => {
							return <div dangerouslySetInnerHTML={{__html:bibItem.text}}></div>
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
  display: {

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

export default CitationsComponent;
