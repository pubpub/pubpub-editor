'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.s3Upload = s3Upload;
function s3Upload(file, progressEvent, finishEvent, index) {
	function beginUpload() {
		var folderName = '';
		var possible = 'abcdefghijklmnopqrstuvwxyz';
		for (var charIndex = 0; charIndex < 8; charIndex++) {
			folderName += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		var extension = file.name !== undefined ? file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2) : 'jpg';

		var filename = folderName + '/' + new Date().getTime() + '.' + extension;
		var fileType = file.type !== undefined ? file.type : 'image/jpeg';
		var formData = new FormData();

		formData.append('key', filename);
		formData.append('AWSAccessKeyId', 'AKIAJQ5MNLCTIMY2ZF7Q');
		formData.append('acl', 'public-read');
		formData.append('policy', JSON.parse(this.responseText).policy);
		formData.append('signature', JSON.parse(this.responseText).signature);
		formData.append('Content-Type', fileType);
		formData.append('success_action_status', '200');
		formData.append('file', file);
		var sendFile = new XMLHttpRequest();
		sendFile.upload.addEventListener('progress', function (evt) {
			progressEvent(evt, index);
		}, false);
		sendFile.upload.addEventListener('load', function (evt) {
			finishEvent(evt, index, file.type, filename, file.name);
		}, false);
		sendFile.open('POST', 'https://s3-external-1.amazonaws.com/assets.pubpub.org', true);
		sendFile.send(formData);
	}

	var getPolicy = new XMLHttpRequest();
	getPolicy.addEventListener('load', beginUpload);
	getPolicy.open('GET', '/api/uploadPolicy?contentType=' + file.type);
	getPolicy.send();
}