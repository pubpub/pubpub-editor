import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import RichEditor from '../src/react/reactRichEditor';
import mentionsComponent from '../src/react/basicMention';

// requires style attributes that would normally be up to the wrapping library to require
require("@blueprintjs/core/dist/blueprint.css");
require("../style/base.scss");

export const StoryBookRichEditor = React.createClass({
	render: function() {
		return (
			<RichEditor mentionsComponent={mentionsComponent} {...this.props} />
		);
	}
});

export default StoryBookRichEditor;
