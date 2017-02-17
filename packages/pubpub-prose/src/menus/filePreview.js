import React, {PropTypes} from 'react';

let styles = {};


const FileTranslation = {
  jpg: 'image',
  png: 'image',
  jpeg: 'image',
  tiff: 'image',
  gif: 'image',
  pdf: 'pdf',
  ipynb: 'jupyter',
  mp4: 'video',
  ogg: 'video',
  webm: 'video',
  csv: 'video',
};

export const FilePreview = React.createClass({
	propTypes: {
    fileURL: PropTypes.string,
	},
  render() {
    const {fileURL} = this.props;
    const extension = fileURL.split('.').pop();
    const fileType = FileTranslation[extension];
    console.log(extension, fileURL, fileType);
    switch (fileType) {
      case 'image':
          return <img style={{width: '100%'}} src={fileURL} />
      case 'video':
      case 'pdf':
      default:
        return <div>Could not Render File</div>
    }

  },
});

export default FilePreview;
