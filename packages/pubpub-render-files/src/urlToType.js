exports.urlToType = (url, defaultType) => {

  if (!url) {
    return null;
  }

  const extension = url.split('.').pop();

  if (!extension) {
    return null;
  }

  switch (extension) {
    case 'tif':
      return 'image/jpg';
    case 'jpg':
      return 'image/jpg';
    case 'png':
      return 'image/png';
		case 'jpeg':
      return 'image/jpeg';
		case 'gif':
      return 'image/jpeg';
    case 'bmp':
      return 'image/jpeg';
    case 'md' :
      return 'text/markdown';
    case 'pdf':
      return 'application/pdf';
    case 'ppub':
      return 'ppub';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/mov';
    case 'avi':
      return 'video/avi';
    case 'pdf':
      return 'application/pdf';
    case 'ppt':
    case 'pptx': 
      return 'application/vnd.ms-powerpoint';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'stl':
      return 'stl';
    default:
      return (defaultType) ? defaultType : 'file';
  }
}
