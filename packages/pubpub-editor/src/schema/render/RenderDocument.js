import React, { PropTypes } from 'react';

import { nodes } from '../baseSchema';

// import ReactDOM from 'react-dom';

export const RenderDocument = React.createClass({
	propTypes: {
    content: PropTypes.object,
	},
	getInitialState() {
		return { };
	},

	componentWillMount() {
	},


  renderContent({item, meta}) {
  	if (!item) {return null;}
  	const content = item.map((node, index) => {
      const nodeType = node.type;
      if (nodes[nodeType] && nodes[nodeType].toReact) {
        return nodes[nodeType].toReact({node, index, renderContent: this.renderContent, meta});
      }
  	});

  	return content;
  },


	render: function() {

    const { content } = this.props;

		return (
			<div className="pub-body">
				{renderContent({ item: content, meta: {} })}
			</div>
		);
	}

});

export default RenderDocument;
