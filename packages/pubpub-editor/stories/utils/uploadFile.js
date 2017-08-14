import samplepolicy from './samplepolicy';

export function s3Upload(file, progressEvent, finishEvent, index) {
	function beginUpload() {
		let folderName = '';
		const possible = 'abcdefghijklmnopqrstuvwxyz';
		for ( let charIndex = 0; charIndex < 8; charIndex++) { folderName += possible.charAt(Math.floor(Math.random() * possible.length)); }
		const extension = file.name !== undefined ? file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2) : 'jpg';

		const filename = folderName + '/' + new Date().getTime() + '.' + extension;
		const fileType = file.type !== undefined ? file.type : 'image/jpeg';
		const formData = new FormData();

		formData.append('key', filename);
		formData.append('AWSAccessKeyId', 'AKIAJQ5MNLCTIMY2ZF7Q');
		formData.append('acl', 'public-read');
		formData.append('policy', samplepolicy.policy);
		formData.append('signature', samplepolicy.signature);
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
				finishEvent(evt, index, file.type, filename, file.name, fileURL);
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
