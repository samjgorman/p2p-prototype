/*

DOCUMENTATION:
https://github.com/sodium-friends/sodium-native
https://sodium-friends.github.io/docs/docs/keyboxencryption
https://download.libsodium.org/doc/public-key_cryptography/authenticated_encryption


NOTES
- sodium.sodium_malloc creates a "secure buffer". Not sure what that means, but it
  sounds important. The examples always use secure buffers for the secret key.

https://download.libsodium.org/doc/public-key_cryptography/authenticated_encryption
- libsodium's box algorithm does public-private key encryption with signatures.
- the nonce used in box is a random set of bytes that could probably be generated by
  the library internally.
- we can improve the performance of box when we're communicating constantly with the
	same person by using the _beforenm and _afternm functions to reuse shared key.

https://download.libsodium.org/doc/public-key_cryptography/sealed_boxes
- libsodium's seal algorithm does public-private key encryption without authenticating
	the signature. It reuses the box algorithm by generating an ephemeral keypair, sending
  the public key with the message, and generating the nonce from the recipients public key.

*/
import sodium from "sodium-native"
import * as crypto from "crypto"

export function createKeys() {
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

function bufferView(buf: Buffer, start: number, length: number) {
	return Buffer.from(buf.buffer, buf.byteOffset + start, length)
}

export function box(args: {
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
	const ciphertext = bufferView(payload, 0, message.length)
	const mac = bufferView(payload, message.length, sodium.crypto_box_MACBYTES)
	const nonce = bufferView(
		payload,
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

export function boxOpen(args: {
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
	const nonce = bufferView(
		payload,
		payload.length - sodium.crypto_box_NONCEBYTES,
		sodium.crypto_box_NONCEBYTES
	)
	const mac = bufferView(
		payload,
		payload.length - sodium.crypto_box_NONCEBYTES - sodium.crypto_box_MACBYTES,
		sodium.crypto_box_MACBYTES
	)
	const ciphertext = bufferView(
		payload,
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

export function seal(args: { message: Buffer; to: { publicKey: Buffer } }) {
	const {
		message,
		to: { publicKey },
	} = args

	// Create payload
	const ciphertext = Buffer.alloc(message.length + sodium.crypto_box_SEALBYTES)

	// Encrypt
	sodium.crypto_box_seal(ciphertext, message, publicKey)
	return ciphertext
}

export function sealOpen(args: {
	payload: Buffer
	to: { publicKey: Buffer; secretKey: Buffer }
}) {
	const {
		payload,
		to: { publicKey, secretKey },
	} = args

	// Create payload
	const message = Buffer.alloc(payload.length - sodium.crypto_box_SEALBYTES)

	// Decrypt
	sodium.crypto_box_seal_open(message, payload, publicKey, secretKey)
	return message
}

// TODO: consider a more secure hashing function to keep public keys anonymous.
export function createHash(message: Buffer | string) {
	return crypto
		.createHash("sha256")
		.update(message)
		.digest()
}

export function randomBytes(bytes: number) {
	const buf = Buffer.alloc(bytes)
	sodium.randombytes_buf(buf)
	return buf
}
