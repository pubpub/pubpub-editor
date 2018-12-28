/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./file.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const File = (props)=> {
	const attrs = props.attrs;
	const extension = attrs.fileName ? attrs.fileName.split('.').pop() : '';

	return (
		<div className="figure-wrapper">
			<figure className={`file ${props.isSelected ? 'isSelected' : ''}`}>
				<div className="bp3-card bp3-elevation-2 details">
					<div className="file-icon file-icon-default" data-type={extension.substring(0, 4)} />
					<div className="file-name">
						<a href={attrs.url} target="_blank" rel="noopener noreferrer" download={attrs.fileName}>
							{attrs.fileName}
						</a>
					</div>
					<div className="file-size" contentEditable={false}>{attrs.fileSize}</div>
					<a className="bp3-button bp3-icon-download" href={attrs.url} target="_blank" rel="noopener noreferrer" download={attrs.fileName} />
				</div>
				{attrs.caption &&
					<figcaption dangerouslySetInnerHTML={{ __html: attrs.caption }} />
				}
			</figure>
		</div>
	);
};

File.propTypes = propTypes;
export default File;
