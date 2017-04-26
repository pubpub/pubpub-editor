import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React, { PropTypes } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

let styles;


const SortableItem = SortableElement(({value}) =>
  <MenuItem text={value}/>
);

const SortableList = SortableContainer(({files}) => {
  return (
    <Menu>
      {files.map((file, index) => (
        <SortableItem key={`item-${index}`} index={index} value={file.name} />
      ))}
    </Menu>
  );
});


export const ExportMenu = React.createClass({
	propTypes: {
		files: PropTypes.object,
	},
	getInitialState: function() {
		return { input: null };
	},

	render: function() {
		const { files } = this.props;

    // const files = Object.values(filesMap);

		return (
			<div className={'pt-card pt-elevation-0'}>
				<SortableList files={files} />
			</div>
		);
	}

});

export default ExportMenu;

styles = {
	textInput: {
		height: '80%',
		verticalAlign: 'baseline',
	},
	container: function(top, left, width) {
		if (!top) {
			return {
				display: 'none'
			};
		}
		return {
			width: `${width}px`,
			position: 'absolute',
			height: '30px',
			lineHeight: '30px',
			padding: '0px',
			textAlign: 'center',
			top: top - 40,
			left: Math.max(left - (width / 2), -50),
			overflow: 'hidden',
		};
	},
	button: {
		minWidth: '5px',
		padding: '0px 7px',
		fontSize: '1.1em',
		outline: 'none',
		borderRadius: '0px',
		color: 'rgba(255, 255, 255, 0.7)',
	},
	active: {
		color: 'rgba(255, 255, 255, 1)',
	},
};
