import React from 'react';
import PropTypes from 'prop-types';

require('./file.scss');

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
			<div className={'file'}>
				<div className={'pt-card pt-elevation-2 details'}>
					<div className={'file-icon file-icon-default'} data-type={extension} />
					<div className={'file-name'}>
						<a href={props.url} target={'_blank'}>{props.fileName}</a>
					</div>
					<div className={'file-size'} >{props.fileSize}</div>
					<a className={'pt-button pt-icon-download'} href={props.url} target={'_blank'} />
				</div>
				{props.caption &&
					<figcaption dangerouslySetInnerHTML={{ __html: props.caption }} />
				}
			</div>
		</div>
	);
};

ImageStatic.propTypes = propTypes;
ImageStatic.defaultProps = defaultProps;
export default ImageStatic;
