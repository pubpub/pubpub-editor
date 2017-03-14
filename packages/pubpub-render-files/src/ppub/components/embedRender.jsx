import React, {PropTypes} from 'react';

import ReactDOM from 'react-dom';
import { RenderFile } from '../../RenderFile';
import { urlToType } from '../../urlToType';

let styles = {};

export const EmbedRender = React.createClass({
	propTypes: {
		url: PropTypes.string,
		align: PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word']),
		size: PropTypes.string,
	},
	getInitialState: function() {
		this.DOC_WIDTH = 650;
		return {
			selected: false,
		};
	},
	getDefaultProps: function() {
		return {
		};
	},

	componentWillUpdate: function(nextProps, nextState) {
	},

	render: function() {
		const {size, align, url, children} = this.props;
		const {selected} = false;

		const data = this.props.data || {};
		// Data is the version object with a populated parent field.
		// The parent field is the atomData field
		const type = urlToType(url);

		const file = { name: '', url, type };

		const captionNode = (children) ? children[0] : null;
		console.log('Got children!', captionNode);
		const captionText = (captionNode) ? captionNode.text : '';
		console.log('GOT CAPTION TEXTv2');

		return (
			<div ref="embedroot" className={'pub-embed ' + this.props.className}>
				<figure style={styles.figure({size, align, false})}>
  				<div style={{width: size, position: 'relative', display: 'table-row'}}>
						<RenderFile file={file} />
  					{/*<img draggable="false" style={styles.image({selected})} src={url}></img>*/}
          </div>
          <figcaption style={styles.caption({size, align})}>
            <div style={styles.captionInput} ref="captioninsert">
              {captionText}
            </div>
          </figcaption>
        </figure>
			</div>
		);
	}
});

styles = {
	image: function({ selected }) {
		return {
			width: '100%',
			outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
		};
	},
	captionInput: {
		width: '100%',
		border: 'none',
		fontSize: '1em',
		minHeight: '1em',
	},
	embed: function({size}) {

		const style = {
			zIndex: 10000,
			pointerEvents: 'all',
			position: 'absolute',
			minWidth: '200px',
			width: `calc(${size} * 0.8)`,
			margin: `0 calc(${size} * 0.1)`,
		};

		const parsedSize = parseInt(size);
		const realSize = 650 * (parsedSize / 100);
		if (realSize * 0.8 < 200) {
			const newMargin = Math.round((realSize - 200) / 2);
			style.margin = `0 ${newMargin}px`
		}
		return style;
	},
	button: {
		padding: '0em 0em',
		height: '0.75em',
		width: '0.75em',
		position: 'relative',
		top: '-0.15em',
		verticalAlign: 'middle',
		display: 'inline-block',
		cursor: 'pointer',
		// border: 'none'
	},
	hover: {
		minWidth: '275px',
		padding: '1em',
		fontSize: '0.85em'
	},
	number: {
		display: 'inline-block',
		height: '100%',
		verticalAlign: 'top',
		position: 'relative',
		top: '-0.45em',
		fontSize: '0.85em',
	},
	outline: function({selected}) {
		return {
			outline: (selected) ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px',

		};
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
	captionText: function({align}) {
		const style = {
			width: '100%',
			display: 'inline-block',
		};
		return style;
	}
};

export default EmbedRender;
