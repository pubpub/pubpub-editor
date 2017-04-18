import React, { PropTypes } from 'react';

import MarkdownEditor from './MarkdownEditor';
import RichEditor from './RichEditor';

require('../../style/base.scss');

export const FullEditor = React.createClass({

	propTypes: {
		initialContent: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
		onChange: PropTypes.func,
		handleFileUpload: PropTypes.func,
		handleReferenceAdd: PropTypes.func,

		localUsers: PropTypes.array,
		localPubs: PropTypes.array,
		localFiles: PropTypes.array,
		localReferences: PropTypes.array,
		localHighlights: PropTypes.array,
		localPages: PropTypes.array,
		globalCategories: PropTypes.array,

		// Unique to Full Editor
		mode: PropTypes.string,
	},

	render: function() {
		if (this.props.mode === 'rich') {
			return <RichEditor {...this.props} />;
		}
		return <MarkdownEditor {...this.props} />;
	},
});

export default FullEditor;
