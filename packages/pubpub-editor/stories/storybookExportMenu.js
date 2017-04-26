import React, { PropTypes } from 'react';
import { localDiscussions, localFiles, localHighlights, localPages, localPubs, localReferences, localUsers } from './sampledocs/autocompleteLocalData';

import { ExportMenu } from '../src/ExportMenu';

export const StoryBookExportMenu = React.createClass({
	render: function() {
		return (
			<ExportMenu files={localFiles} {...this.props} />
		);
	}
});

export default StoryBookExportMenu;
