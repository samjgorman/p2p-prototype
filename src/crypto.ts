// https://github.com/bcomnes/sodium-cli/blob/master/index.js
// https://github.com/sodium-friends/sodium-native

// https://sodium-friends.github.io/docs/docs/keyboxencryption
// https://download.libsodium.org/doc/public-key_cryptography/authenticated_encryption

// MAC is a signature
// Nonce is a random thing
// We can generate and reuse a shared key if we want (see documentation).

import sodium from "sodium-native"

export function createKeys() {
	// TODO: check `publicKey.secure` and `secretKey.secure`?
	// Apparently `sodium.sodium_malloc` makes a "secure buffer" while Buffer.alloc is not.
	const publicKey = sodium.sodium_malloc(sodium.crypto_box_PUBLICKEYBYTES)
	const secretKey = sodium.sodium_malloc(sodium.crypto_box_SECRETKEYBYTES)

	// Fill buffers with new keypair
	sodium.crypto_box_keypair(publicKey, secretKey)

	return {
		publicKey,
		secretKey,
		dealloc() {
			sodium.sodium_memzero(publicKey)
			sodium.sodium_memzero(secretKey)
		},
	}
}

export function encrypt(args: {
	message: Buffer
	from: { secretKey: Buffer }
	to: { publicKey: Buffer }
}) {
	const {
		message,
		from: { secretKey },
		to: { publicKey },
	} = args
	const ciphertext = Buffer.alloc(message.length)
	const mac = Buffer.alloc(sodium.crypto_box_MACBYTES) // signature
	const nonce = Buffer.alloc(sodium.crypto_box_NONCEBYTES)
	sodium.randombytes_buf(nonce)
	sodium.crypto_box_detached(
		ciphertext,
		mac,
		message,
		nonce,
		publicKey,
		secretKey
	)

	const result = Buffer.alloc(ciphertext.length + mac.length + nonce.length)
	ciphertext.copy(result, 0)
	mac.copy(result, ciphertext.length)
	nonce.copy(result, ciphertext.length + mac.length)
	return result
}

export function decrypt(args: {
	encrypted: Buffer
	from: { publicKey: Buffer }
	to: { secretKey: Buffer }
}) {
	const {
		encrypted,
		from: { publicKey },
		to: { secretKey },
	} = args

	const mac = Buffer.alloc(sodium.crypto_box_MACBYTES)
	const nonce = Buffer.alloc(sodium.crypto_box_NONCEBYTES)
	encrypted.copy(mac, 0, encrypted.length - nonce.length - mac.length)
	encrypted.copy(nonce, 0, encrypted.length - nonce.length)
	const ciphertext = encrypted.slice(
		0,
		encrypted.length - nonce.length - mac.length
	)

	const message = Buffer.alloc(ciphertext.length)
	const verified = sodium.crypto_box_open_detached(
		message,
		ciphertext,
		mac,
		nonce,
		publicKey,
		secretKey
	)
	if (!verified) {
		return
	}
	return message
}
