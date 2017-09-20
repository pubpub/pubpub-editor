import getPolicy from './getPolicy';

function s3Upload(file, finishEvent, index) {
	function beginUpload() {
		let folderName = '';
		const possible = 'abcdefghijklmnopqrstuvwxyz';
		for ( let charIndex = 0; charIndex < 8; charIndex++) { folderName += possible.charAt(Math.floor(Math.random() * possible.length)); }
		const extension = file.name !== undefined ? file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2) : 'jpg';

		const filename = folderName + '/' + new Date().getTime() + '.' + extension;
		const fileType = file.type !== undefined ? file.type : 'image/jpeg';
		const formData = new FormData();

		const policy = getPolicy();

		formData.append('key', filename);
		formData.append('AWSAccessKeyId', 'AKIAJQ5MNLCTIMY2ZF7Q');
		formData.append('acl', 'public-read');
		formData.append('policy', policy.policy);
		formData.append('signature', policy.signature);
		formData.append('Content-Type', fileType);
		formData.append('success_action_status', '200');
		formData.append('file', file);
		const sendFile = new XMLHttpRequest();
		sendFile.upload.addEventListener('progress', (evt)=>{
			if (progressEvent) {
				progressEvent(evt, index);
			}
		}, false);

		sendFile.upload.addEventListener('load', (evt)=>{
			if (finishEvent) {
				const fileURL = 'https://assets.pubpub.org/' + filename;
        finishEvent({url: fileURL});
				// finishEvent(evt, index, file.type, filename, file.name, fileURL);
			}
		}, false);
		sendFile.open('POST', 'https://s3-external-1.amazonaws.com/assets.pubpub.org', true);
		sendFile.send(formData);
	}
	beginUpload();

	/*
	const getPolicy = new XMLHttpRequest();
		getPolicy.addEventListener('load', beginUpload);
		getPolicy.open('GET', 'https://www.pubpub.org/api/uploadPolicy?contentType=' + file.type);
		getPolicy.send();
	*/
}

export default s3Upload;
