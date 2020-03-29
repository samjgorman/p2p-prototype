import * as fs from "fs-extra"
import * as path from "path"
import {
	createKeys,
	randomBytes,
	createHash,
	box,
	seal,
	sealOpen,
	boxOpen,
} from "./crypto"
import inquirer from "inquirer"
import signalhub from "signalhub"

function getPublicKeyId(publicKey: Buffer) {
	return createHash(publicKey).toString("base64")
}

type PublicChannelMessage =
	| { type: "seal"; payload: string }
	| { type: "box"; from: string; payload: string }

type PublicChannelMessagePayload = InviteResponseMessage | InviteAckMessage

type InviteResponseMessage = {
	type: "invite"
	password: string
	publicKey: string
}
type InviteAckMessage = { type: "invite-ack" }

async function main() {
	// const { identity } = await inquirer.prompt([
	// 	{
	// 		type: "input",
	// 		name: "identity",
	// 		message: "What identity do you want to use?",
	// 	},
	// ])
	const identity = "a"

	const identityPath = path.join(__dirname, "..", "identities", identity)
	await fs.mkdirp(identityPath)

	const publicKeyPath = path.join(identityPath, "public.key")
	const secretKeyPath = path.join(identityPath, "secret.key")

	const hasKey = await fs.pathExists(publicKeyPath)
	let me: { publicKey: Buffer; secretKey: Buffer }
	if (!hasKey) {
		console.log("Generating keys.")
		me = createKeys()
		// await fs.writeFile(publicKeyPath, me.publicKey)
		// await fs.writeFile(secretKeyPath, me.secretKey)
	} else {
		me = {
			publicKey: await fs.readFile(publicKeyPath),
			secretKey: await fs.readFile(secretKeyPath),
		}
	}

	const { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What do you want to do?",
			choices: ["sendInvite", "acceptInvite", "connectToSomeone"],
		},
	])

	const hub = signalhub("chets-p2p-prototype", [
		"https://signalhub-jccqtwhdwc.now.sh",
		// "https://signalhub-hzbibrznqa.now.sh",
	])

	if (action === "sendInvite") {
		// Create an invite payload
		const password = randomBytes(32)
		const invite = Buffer.concat([password, me.publicKey]).toString("base64")

		console.log("password", password.toString("base64"))
		console.log("publicKey", me.publicKey.toString("base64"))

		console.log("Send this payload to someone:")
		console.log(invite)

		console.log(
			"Listening for invite response on:",
			getPublicKeyId(me.publicKey)
		)
		const publicKey = await new Promise<Buffer>(resolve => {
			const stream = hub.subscribe(getPublicKeyId(me.publicKey))
			stream.on("data", (message: PublicChannelMessage) => {
				if (message.type === "seal") {
					const data = sealOpen({
						payload: Buffer.from(message.payload, "base64"),
						to: me,
					})
					// TODO: what happens if we can't unseal?
					const result: PublicChannelMessagePayload = JSON.parse(
						data.toString("utf8")
					)
					if (result.type === "invite") {
						if (result.password === password.toString("base64")) {
							stream.destroy()
							resolve(Buffer.from(result.publicKey, "base64"))
						} else {
							console.log("wrong invite password")
						}
					} else {
						console.log("wrong public channel payload type")
					}
				} else {
					console.log("wrong public channel message type")
				}
			})
		})

		const message: InviteAckMessage = {
			type: "invite-ack",
		}
		const payload = box({
			message: Buffer.from(JSON.stringify(message), "utf8"),
			from: me,
			to: { publicKey },
		})

		const channelMessage: PublicChannelMessage = {
			type: "box",
			from: getPublicKeyId(me.publicKey),
			payload: payload.toString("base64"),
		}
		console.log("Sending invite ack to:", getPublicKeyId(publicKey))
		hub.broadcast(getPublicKeyId(publicKey), channelMessage)

		// Listen for webrtc connection now.
		console.log("HERE")

		return
	}

	if (action === "acceptInvite") {
		const { invite } = await inquirer.prompt([
			{
				type: "input",
				name: "invite",
				message: "What's the invite token?",
			},
		])

		const token = Buffer.from(invite.trim(), "base64")
		const password = token.slice(0, 32).toString("base64")
		const publicKey = token.slice(32)
		console.log("password", password)
		console.log("publicKey", publicKey.toString("base64"))

		const message: InviteResponseMessage = {
			type: "invite",
			password: password,
			publicKey: me.publicKey.toString("base64"),
		}
		const payload = seal({
			message: Buffer.from(JSON.stringify(message), "utf8"),
			to: { publicKey },
		})
		const channelMessage: PublicChannelMessage = {
			type: "seal",
			payload: payload.toString("base64"),
		}

		console.log("Sending invite response to: ", getPublicKeyId(publicKey))
		hub.broadcast(getPublicKeyId(publicKey), channelMessage)

		await new Promise<void>(resolve => {
			console.log("Listening for ack on: ", getPublicKeyId(me.publicKey))
			const stream = hub.subscribe(getPublicKeyId(me.publicKey))
			stream.on("data", (message: PublicChannelMessage) => {
				if (message.type === "box") {
					if (message.from === getPublicKeyId(publicKey)) {
						const data = boxOpen({
							payload: Buffer.from(message.payload, "base64"),
							from: { publicKey },
							to: me,
						})

						if (!data) {
							console.log("Bad data?")
							return
						}
						const result: PublicChannelMessagePayload = JSON.parse(
							data.toString("utf8")
						)
						if (result.type === "invite-ack") {
							stream.destroy()
							resolve()
						} else {
							console.log("wrong payload type")
						}
					} else {
						console.log("message from the wrong person")
					}
				} else {
					console.log("wrong public channel message type")
				}
			})
		})

		// Try to connect via simple-peer
		console.log("HERE")

		return
	}

	if (action === "connectToSomeone") {
		return
	}
}

main()
