import React from 'react';
import PropTypes from 'prop-types';
import linkifyStr from 'linkifyjs/string';
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

require('./footnote.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
};

const FootnoteStatic = function(props) {
	return (
		<div className={'footnote-wrapper'}>
			<Popover
				content={
					<div className={'footnote-text pt-card pt-elevation-2'}>
						{props.value &&
							<div
								dangerouslySetInnerHTML={{
									__html: linkifyStr(props.value, {
										defaultProtocol: 'https',
										className: ''
									})
								}}
							/>
						}
						{!props.value &&
							<div className={'empty-footnote-text'}>
								No Footnote text entered...
							</div>
						}
					</div>
				}
				interactionKind={PopoverInteractionKind.CLICK}
				position={Position.TOP_LEFT}
				popoverClassName={'pt-minimal footnote-popover'}
				transitionDuration={-1}
				inheritDarkTheme={false}
				tetherOptions={{
					constraints: [{ attachment: 'together', to: 'window' }]
				}}

			>
				<sup className={'footnote editable-render'}>{props.count}</sup>
			</Popover>
		</div>
	);
};

FootnoteStatic.propTypes = propTypes;
export default FootnoteStatic;
