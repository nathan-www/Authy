import crypto from 'crypto';

/*
Cryptographically Secure Pseudo-Random String generator
*/
export function secureRandomString(byteLength = 24) {
	return crypto.randomBytes(byteLength).toString('base64');
}

/*
Random number of length + with prefix (not cryptographically secure)
*/
export function randomNumber(len = 17, prefix = 1) {
	const min = Math.pow(10, len - 2);
	const max = Math.pow(10, len - 1) - 1;
	return Number(prefix.toString() + Math.floor((Math.random() * (max - min)) + min));
}