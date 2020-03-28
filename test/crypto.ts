import ava from "ava"
import { createKeys, encrypt, decrypt } from "../src/crypto"

ava("Encrypt/decrypt", t => {
	const a = createKeys()
	const b = createKeys()

	const original = "hello world"
	const encrypted = encrypt({
		message: Buffer.from(original, "utf8"),
		from: a,
		to: b,
	})
	const decrypted = decrypt({
		...encrypted,
		from: a,
		to: b,
	})
	t.is(original, decrypted.toString("utf8"))
})
