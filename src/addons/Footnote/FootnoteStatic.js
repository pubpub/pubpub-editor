import React from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

require('./footnote.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
};

const FootnoteStatic = function(props) {
	return (
		<span className="footnote-wrapper">
			<Popover
				content={
					<span className="footnote-text">
						{props.value &&
							<span dangerouslySetInnerHTML={{ __html: props.value }} />
						}
						{!props.value &&
							<span className="empty-footnote-text">
								No Footnote text entered...
							</span>
						}
					</span>
				}
				interactionKind={PopoverInteractionKind.CLICK}
				position={Position.TOP_LEFT}
				popoverClassName="footnote-popover"
				transitionDuration={-1}
				inheritDarkTheme={false}
				tetherOptions={{
					constraints: [{ attachment: 'together', to: 'window' }]
				}}

			>
				<span className="render-wrapper">
					<sup className="footnote">{props.count}</sup>
				</span>
			</Popover>
		</span>
	);
};

FootnoteStatic.propTypes = propTypes;
export default FootnoteStatic;
