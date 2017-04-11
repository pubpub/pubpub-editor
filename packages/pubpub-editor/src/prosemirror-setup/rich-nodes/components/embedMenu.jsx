import { Button, Collapse, Switch } from '@blueprintjs/core';
import React, {PropTypes} from 'react';

export const EmbedEditor = React.createClass({
	propTypes: {
		embedAttrs: PropTypes.object,
    updateParams: PropTypes.func,
  },

	getInitialState: function() {
		return {caption: null};
	},

  setEmbedAttribute: function(key, value, evt) {
		const obj = {};
		obj[key] = value;
		this.props.updateParams(obj);
  },

	toggleCaption: function(evt) {
		const checked = !!this.props.embedAttrs.caption;
		if (checked) {
			this.props.removeCaption();
		} else {
			this.props.createCaption();
		}
	},

	render: function() {

		return (
			<div>
				<div className="pt-button-group minimal">
				  <Button iconName="align-left" onClick={this.setEmbedAttribute.bind(this, 'align', 'left')} ></Button>
					<Button iconName="align-center" onClick={this.setEmbedAttribute.bind(this, 'align', 'full')} ></Button>
					<Button iconName="align-right" onClick={this.setEmbedAttribute.bind(this, 'align', 'right')} ></Button>
				</div>
				<br/>

				<div className={"pt-text-muted"} style={{marginTop: 10, fontSize: '0.75em'}}>Options</div>
				<hr style={{marginTop: 0, marginBottom: 8}}/>
				<Switch checked={!!this.props.embedAttrs.caption} label="Caption" onChange={this.toggleCaption} />
			</div>
	  );

	}
});

export default EmbedEditor;
