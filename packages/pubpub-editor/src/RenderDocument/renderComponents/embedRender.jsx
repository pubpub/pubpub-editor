import React, {PropTypes} from 'react';

import { RenderFile } from '@pubpub/render-files';
import { URLToType } from '@pubpub/render-files';

let styles = {};

export const EmbedRender = React.createClass({
	propTypes: {
		url: PropTypes.string,
		align: PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word']),
		size: PropTypes.string,
	},
	getInitialState: function() {
		return {
			selected: false,
		};
	},
	render: function() {
		const { size, align, url, children } = this.props;
		const { selected } = false;

		const data = this.props.data || {};
		// Data is the version object with a populated parent field.
		// The parent field is the atomData field
		const type = URLToType(url);

		const file = { name: '', url, type };

		const captionNode = (children) ? children[0] : null;
		const captionText = (captionNode) ? captionNode.text : '';

		return (
			<div ref="embedroot" className={'pub-embed ' + this.props.className}>
				<figure style={styles.figure({size, align, false})}>
  				<div style={{width: size, position: 'relative', display: 'table-row'}}>
						<RenderFile file={file} />
          </div>
          <figcaption style={styles.caption({size, align})}>
            <div style={styles.captionInput} ref="captioninsert">
              {children}
            </div>
          </figcaption>
        </figure>
			</div>
		);
	}
});

styles = {
	captionInput: {
		width: '100%',
		border: 'none',
		fontSize: '1em',
		minHeight: '1em',
	},
	figure: function({size, align, selected}) {
		const style = {
			width: size,
			display: 'table',
			outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px',
		};
		if (align === 'left') {
			style.float = 'left';
		} else if (align === 'right') {
			style.float = 'right';
		} else if (align === 'full') {
			style.margin = '0 auto';
		}
 		return style;
	},
	caption: function({size, align}) {
		const style = {
			width: size,
			display: 'table-row',
		};
		return style;
	},
};

export default EmbedRender;
