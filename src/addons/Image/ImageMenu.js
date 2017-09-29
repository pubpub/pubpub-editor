import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Switch } from '@blueprintjs/core';

const propTypes = {
	embedAttrs: PropTypes.object.isRequired,
	updateParams: PropTypes.func.isRequired,
};

class ImageMenu extends Component {
	constructor(props) {
		super(props);
		this.state = { caption: null };
	}

	setEmbedAttribute = (key, value, evt) => {
		const obj = {};
		obj[key] = value;
		this.props.updateParams(obj);
	}

	toggleCaption = (evt) => {
		const checked = !!this.props.embedAttrs.caption;
		if (checked) {
			this.props.removeCaption();
		} else {
			this.props.createCaption();
		}
	}

	render() {
		const { align } = this.props;
		return (
			<div>
				<div className="pt-button-group minimal">
					<Button
						className={(align === 'left') ? 'pt-active' : ''}
						iconName="align-left"
						onClick={this.setEmbedAttribute.bind(this, 'align', 'left')}
					/>
					<Button
						className={(align === 'right') ? 'pt-active' : ''}
						iconName="align-right"
						onClick={this.setEmbedAttribute.bind(this, 'align', 'right')}
					/>
					<Button
						className={(align === 'full') ? 'pt-active' : ''}
						iconName="align-center"
						onClick={this.setEmbedAttribute.bind(this, 'align', 'full')}
					/>
					<Button
						className={(align === 'max') ? 'pt-active' : ''}
						iconName="vertical-distribution"
						onClick={this.setEmbedAttribute.bind(this, 'align', 'max')}
					/>
				</div>
				<br/>

				<div className={'pt-text-muted'} style={{ marginTop: 10, fontSize: '0.75em' }}>Options</div>
				<hr style={{ marginTop: 0, marginBottom: 8 }} />
				<Switch checked={!!this.props.embedAttrs.caption} label="Caption" onChange={this.toggleCaption} />
			</div>
		);
	}
}

ImageMenu.propTypes = propTypes;
export default ImageMenu;
