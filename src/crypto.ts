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

	// Alloc only a single buffer for the whole payload.
	const payload = Buffer.alloc(
		message.length + sodium.crypto_box_MACBYTES + sodium.crypto_box_NONCEBYTES
	)

	// Create a view of the payload for the ciphertext, mac, and nonce.
	const ciphertext = Buffer.from(payload.buffer, 0, message.length)
	const mac = Buffer.from(
		payload.buffer,
		message.length,
		sodium.crypto_box_MACBYTES
	)
	const nonce = Buffer.from(
		payload.buffer,
		message.length + sodium.crypto_box_MACBYTES,
		sodium.crypto_box_NONCEBYTES
	)

	// Create the nonce.
	sodium.randombytes_buf(nonce)

	// Encrypt
	sodium.crypto_box_detached(
		ciphertext,
		mac,
		message,
		nonce,
		publicKey,
		secretKey
	)
	return payload
}

export function decrypt(args: {
	payload: Buffer
	from: { publicKey: Buffer }
	to: { secretKey: Buffer }
}) {
	const {
		payload,
		from: { publicKey },
		to: { secretKey },
	} = args

	// Create a view of the nonce, mac, and ciphertext inside the payload.
	const nonce = Buffer.from(
		payload.buffer,
		payload.length - sodium.crypto_box_NONCEBYTES,
		sodium.crypto_box_NONCEBYTES
	)
	const mac = Buffer.from(
		payload.buffer,
		payload.length - sodium.crypto_box_NONCEBYTES - sodium.crypto_box_MACBYTES,
		sodium.crypto_box_MACBYTES
	)
	const ciphertext = Buffer.from(
		payload.buffer,
		0,
		payload.length - sodium.crypto_box_NONCEBYTES - sodium.crypto_box_MACBYTES
	)

	// Alloc for the message
	const message = Buffer.alloc(ciphertext.length)

	// Decrypt and verify signature.
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
