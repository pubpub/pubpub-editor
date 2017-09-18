import React, { Component, PropTypes } from 'react';

class EditorProvider extends Component {
  static propTypes = {
    view: PropTypes.object.isRequired,
		editorState: PropTypes.object.isRequired,
    transaction: PropTypes.object.isRequired,
		containerId: PropTypes.string.isRequired,
  }
  render() {
		const { view, containerId, editorState, children, transaction } = this.props;
    return <div>
			{ React.Children.map(children, (child => React.cloneElement(child, { view, containerId, editorState, transaction } )))}
		</div>;
  }
}

export default EditorProvider;
