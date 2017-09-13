import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React, { PropTypes } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';

let styles;

const DragHandle = SortableHandle(() => <span>::</span>);

const SortableItem = SortableElement(({ value, disabled, toggleItem }) => {
  console.log('got disabled', disabled);
  return (
    <div>
      <DragHandle />
      <MenuItem
        text={value}
        label={<label className="pt-control pt-checkbox">
          <input type="checkbox" checked={!disabled} />
          <span onClick={toggleItem} className="pt-control-indicator"></span>
        </label>}
        />
    </div>
  );
  }
);

const SortableList = SortableContainer(({ files, toggleItem }) => {
  return (
    <Menu>
      {files.map((file, index) => {
        const toggle = () => {toggleItem(index)};
        return (<SortableItem
          key={`item-${index}`}
          index={index}
          toggleItem={toggle}
          disabled={file.disabled}
          value={file.name} />
        );
      }
    )}
    </Menu>
  );
});


export const ExportMenu = React.createClass({
	propTypes: {
		files: PropTypes.object,
	},
	getInitialState: function() {
		return { files: this.props.files };
	},

  toggleItem: function(index) {
    const files = this.state.files;
    files[index].disabled = !files[index].disabled;
    this.setState({ files });
  },

  onSortEnd: function({oldIndex, newIndex}) {
    this.setState({
      files: arrayMove(this.state.files, oldIndex, newIndex),
    });
  },

	render: function() {
    const files = this.state.files || this.props.files;

    const docFiles = files.filter((file) => {
      return (file.type === 'text/markdown' || file.type === 'ppub');
    });

		return (
			<div className={'pt-card pt-elevation-0'}>
				<SortableList useDragHandle={true} files={docFiles} onSortEnd={this.onSortEnd} toggleItem={this.toggleItem} />
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
