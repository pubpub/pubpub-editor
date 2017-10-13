import React from 'react';
import PropTypes from 'prop-types';

require('./fileAddon.scss');

const propTypes = {
	url: PropTypes.string,
	fileName: PropTypes.string,
	fileSize: PropTypes.string,
	caption: PropTypes.string,
};

const defaultProps = {
	url: '',
	fileName: '',
	fileSize: '',
	caption: '',
};

const ImageStatic = function(props) {
	if (!props.url) { return null; }
	const extension = props.fileName.split('.').pop();
	return (
		<div className={'file-figure-wrapper'}>
			<div className={'file pt-card pt-elevation-2'}>
				<div className={'details'}>
					<div className={'extension'}>{extension}</div>
					<div className={'file-name'}>{props.fileName}</div>
					<div className={'file-size'}>{props.fileSize}</div>
					<a className={'pt-button pt-icon-download'} href={props.url} target={'_blank'} />
				</div>
			</div>
			<figcaption>
				{props.caption}
			</figcaption>
		</div>
	);
};

ImageStatic.propTypes = propTypes;
ImageStatic.defaultProps = defaultProps;
export default ImageStatic;
