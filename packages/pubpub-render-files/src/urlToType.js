exports.urlToType = (url) => {

  if (!url) {
    return null;
  }

  const extension = url.split('.').pop();

  if (!extension) {
    return null;
  }

  switch (extension) {
    case 'jpg':
      return 'image/jpg';
    case 'png':
      return 'image/png';
		case 'jpeg':
      return 'image/jpeg';
		case 'gif':
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
    case 'stl':
      return 'stl';
    default:
      return null;
  }
}
