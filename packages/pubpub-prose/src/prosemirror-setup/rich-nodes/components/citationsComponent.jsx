import React, {PropTypes} from 'react';

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

	deleteClick: function(bibItem) {
		this.props.deleteItem(bibItem);
	},

  renderDisplay() {
		const { citations } = this.props;
		const citationData = citations.map((citation) => citation.data);
		const citationIDs = citations.map((citation) => citation.citationID).filter((citationID) => !!citationID);

		const bib = this.props.getBibliography(citationData, citationIDs);
		let hideCitations = !(bib && bib.length > 0);
    return (
      <div className="pub-citations" onClick={this.preventClick}>
				{(!hideCitations) ?
					<div>
		        <h3>Citations: </h3>
						{bib.map((bibItem) => {
							return (<div className="pub-citation">
								<span dangerouslySetInnerHTML={{__html:bibItem.text}}></span>
								{/*<button type="button" className="pt-button pt-icon-cross pt-minimal pub-citation-btn" onClick={this.deleteClick}></button>*/}
								</div>);
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

export default CitationsComponent;
