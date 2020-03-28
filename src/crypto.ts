// https://github.com/bcomnes/sodium-cli/blob/master/index.js
// https://github.com/sodium-friends/sodium-native
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

// https://sodium-friends.github.io/docs/docs/keyboxencryption
// https://download.libsodium.org/doc/public-key_cryptography/authenticated_encryption
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
	return { ciphertext, mac, nonce }
}

export function decrypt(args: {
	ciphertext: Buffer
	mac: Buffer
	nonce: Buffer
	from: { publicKey: Buffer }
	to: { secretKey: Buffer }
}) {
	const {
		ciphertext,
		mac,
		nonce,
		from: { publicKey },
		to: { secretKey },
	} = args
	const message = Buffer.alloc(ciphertext.length)
	sodium.crypto_box_open_detached(
		message,
		ciphertext,
		mac,
		nonce,
		publicKey,
		secretKey
	)
	return message
}
