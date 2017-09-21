import React, { Component } from 'react';

import PropTypes from 'prop-types';

let styles = {};

const propTypes = {
	url: PropTypes.string,
	align: PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word', 'max']),
	size: PropTypes.string,
};

class ImageStatic extends Component {

	render() {
		const { size, align, url, children } = this.props;
		const captionNode = (children) ? children[0] : null;
		const captionText = (captionNode) ? captionNode.text : '';

		return (
			<div ref="embedroot" className={'pub-embed ' + (this.props.className) ? this.props.className : null }>
				<figure style={styles.figure({size, align, selected: false})}>
  				<div style={styles.row({size, align})}>
						<img style={styles.image} src={url}/>
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
}

styles = {
	row: function ({ size, align }) {
		return {
			width: (align !== 'max') ? size : '100%',
			position: 'relative',
			display: 'table-row'
		};
	},
	captionInput: {
		width: '100%',
		border: 'none',
		fontSize: '1em',
		minHeight: '1em',
	},
	image: {
		width: '100%',
	},
	figure: function({size, align, selected}) {
		const style = {
			width: size,
			display: 'table',
			outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px',
			marginRight: (align === 'left') ? '20px' : null,
			marginLeft: (align === 'right') ? '20px' : null,
		};
		if (align === 'max') {
			style.width = 'calc(100% + 30px)';
			style.margin = '0 0 0 -15px';
		} else if (align === 'left') {
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

export default ImageStatic;
