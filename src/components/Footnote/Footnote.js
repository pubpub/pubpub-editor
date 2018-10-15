/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./footnote.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const Footnote = (props)=> {
	const attrs = props.attrs;

	return (
		<div className="footnote-wrapper">
			<span className={`count-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
				<sup className="footnote">{attrs.count}</sup>
			</span>

			<div className="render-wrapper">
				{attrs.value &&
					<div dangerouslySetInnerHTML={{ __html: attrs.value }} />
				}
				{attrs.structuredValue &&
					<div dangerouslySetInnerHTML={{ __html: attrs.structuredHtml }} />
				}
				{!attrs.value && !attrs.structuredValue &&
					<div className="empty-text">
						No Footnote text entered...
					</div>
				}
			</div>
		</div>
	);
};

Footnote.propTypes = propTypes;
export default Footnote;
