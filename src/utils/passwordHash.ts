/*
Hash and verify passwords
*/

import * as argon2 from 'argon2';

// TODO: Store this pepper SECURELY
// Note: Generate with crypto.randomBytes(64).toString('hex')
const pepper = '3842363a26a54e73c3108405002cd680bf21b41987dc85cf14f696f5bbd13872a737303269f0039cfa98a5ab1badb7d432c42c03496f0c3419c8b59a96eb0ca0';

export async function hashPassword(password: string) {
    return await argon2.hash(password, {
        secret: Buffer.from(pepper, 'hex')
    });
}

export async function verifyPassword(hash: string, password: string) {
    return await argon2.verify(hash, password, {
        secret: Buffer.from(pepper, 'hex')
    });
}

