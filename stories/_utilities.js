import crypto from 'crypto';
import katex from 'katex';
import { awsConfig } from './_config';

export const editorWrapperStyle = {
	border: '1px solid #CCC',
	width: '700px',
	minHeight: '250px',
	cursor: 'text',
	padding: '20px',
	paddingRight: '200px',
};

// export const firebaseConfig = {
// 	apiKey: 'AIzaSyDGttY0gbzGUhrrUD9f9bllMxmYWl3WWoc',
// 	authDomain: 'pubpub-v4-dev.firebaseapp.com',
// 	databaseURL: 'https://pubpub-v4-dev.firebaseio.com',
// 	projectId: 'pubpub-v4-dev',
// 	storageBucket: 'pubpub-v4-dev.appspot.com',
// 	messagingSenderId: '175246944410'
// };

export const firebaseConfig = {
	apiKey: 'AIzaSyBpE1sz_-JqtcIm2P4bw4aoMEzwGITfk0U',
	authDomain: 'pubpub-rich.firebaseapp.com',
	databaseURL: 'https://pubpub-rich.firebaseio.com',
	projectId: 'pubpub-rich',
	storageBucket: 'pubpub-rich.appspot.com',
	messagingSenderId: '543714905893',
};

export const clientData = {
	id: 'storybook-clientid',
	name: 'Anon User',
	backgroundColor: 'rgba(0, 0, 250, 0.2)',
	cursorColor: 'rgba(0, 0, 250, 1.0)',
	image: 'https://s3.amazonaws.com/uifaces/faces/twitter/rickdt/128.jpg',
	initials: 'DR',
	canEdit: true,
};

export function renderLatex(val, isBlock, callback) {
	// Toss this in a timeout eventually to test async
	setTimeout(()=> {
		try {
			const displayHTML = katex.renderToString(val, {
				displayMode: isBlock,
				throwOnError: false
			});
			callback(displayHTML);
		} catch (err) {
			callback('<div class="pub-latex-error">Error rendering equation</div>');
		}
	}, 500);
}

export function getPolicy() {
	const s3 = {
		access_key: awsConfig.AWS_ACCESS_KEY_ID,
		secret_key: awsConfig.AWS_SECRET_ACCESS_KEY,
		bucket: 'assets.pubpub.org',
		acl: 'public-read',
		https: 'true',
		error_message: '',
		pad: function(padding) {
			if ((padding + '').length === 1) {
				return '0' + padding;
			}
			return '' + padding;
		},
		expiration_date: function() {
			// const now = new Date();
			// const date = new Date(now.getTime() + (3600 * 1000));
			// let edate = date.getFullYear() + '-' + this.pad(date.getMonth() + 1) + '-' + this.pad(date.getDate());
			// edate += 'T' + this.pad(date.getHours()) + ':' + this.pad(date.getMinutes()) + ':' + this.pad(date.getSeconds()) + '.000Z';
			return new Date(Date.now() + 60000);
		}
	};

	const bucket = s3.bucket; // the name you've chosen for the bucket
	const key = '/${filename}'; // the folder and adress where the file will be uploaded; ${filename} will be replaced by original file name (the folder needs to be public on S3!)
	const successActionRedirect = 'http://localhost:3000/upload/success'; // URL that you will be redirected to when the file will be successfully uploaded
	const contentType = null; // limit accepted content types; empty will disable the filter; for example: 'image/', 'image/png'
	const acl = s3.acl; // private or public-read

	// THIS YOU DON'T
	let policy = { expiration: s3.expiration_date(),
		conditions: [
			{ bucket: bucket },
			['starts-with', '$key', ''],
			{ acl: acl },
			{ success_action_status: '200' },
			['starts-with', '$Content-Type', ''],
		]
	};
	policy = new Buffer(JSON.stringify(policy)).toString('base64').replace(/\n|\r/, '');
	const hmac = crypto.createHmac('sha1', s3.secret_key);
	hmac.update(policy);
	const signature = hmac.digest('base64');

	return {
		bucket: bucket,
		aws_key: s3.access_key,
		acl: acl,
		key: key,
		redirect: successActionRedirect,
		content_type: contentType,
		policy: policy,
		signature: signature
	};
}

export function generateHash(length) {
	const tokenLength = length || 32;
	const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

	let hash = '';
	for (let index = 0; index < tokenLength; index++) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return hash;
}

export function s3Upload(file, progressEvent, finishEvent, index) {
	function beginUpload() {
		const folderName = window.location.hostname !== 'localhost' && window.location.hostname !== 'dev.pubpub.org'
			? generateHash(8)
			: '_testing';

		const extension = file.name !== undefined ? file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2) : 'jpg';

		// const filename = folderName + '/' + new Date().getTime() + '.' + extension;
		const filename = folderName + '/' + (Math.floor(Math.random() * 8)) + new Date().getTime() + '.' + extension;
		const fileType = file.type !== undefined ? file.type : 'image/jpeg';
		const formData = new FormData();

		formData.append('key', filename);
		formData.append('AWSAccessKeyId', 'AKIAJQ5MNLCTIMY2ZF7Q');
		formData.append('acl', 'public-read');
		formData.append('policy', JSON.parse(this.responseText).policy);
		formData.append('signature', JSON.parse(this.responseText).signature);
		formData.append('Content-Type', fileType);
		formData.append('success_action_status', '200');
		formData.append('file', file);
		const sendFile = new XMLHttpRequest();
		sendFile.upload.addEventListener('progress', (evt)=>{
			progressEvent(evt, index);
		}, false);
		sendFile.upload.addEventListener('load', (evt)=>{
			finishEvent(evt, index, file.type, filename, file.name);
		}, false);
		sendFile.open('POST', 'https://s3-external-1.amazonaws.com/assets.pubpub.org', true);
		sendFile.send(formData);
	}

	const getPolicyRequest = new XMLHttpRequest();
	const urlPrefix = window.location.origin.indexOf('localhost:') > -1
		? 'http://localhost:9876'
		: 'https://pubpub-api-v4-dev.herokuapp.com';
	getPolicyRequest.addEventListener('load', beginUpload);
	getPolicyRequest.open('GET', `${urlPrefix}/uploadPolicy?contentType=${file.type}`);
	getPolicyRequest.send();
}
