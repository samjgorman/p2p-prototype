import ava from "ava"
import { createKeys, box, boxOpen, seal, sealOpen } from "../main/crypto"

ava("box", t => {
	const a = createKeys()
	const b = createKeys()

	const original = "hello world"
	const payload = box({
		message: Buffer.from(original, "utf8"),
		from: a,
		to: b,
	})
	const decrypted = boxOpen({
		payload,
		from: a,
		to: b,
	})
	t.is(original, decrypted.toString("utf8"))
})

ava("seal", t => {
	const a = createKeys()

	const original = "hello world"
	const payload = seal({
		message: Buffer.from(original, "utf8"),
		to: a,
	})
	const decrypted = sealOpen({
		payload,
		to: a,
	})
	t.is(original, decrypted?.toString("utf8"))
})
