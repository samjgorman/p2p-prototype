import * as fs from "fs-extra"
import * as path from "path"
import * as _ from "lodash"
import {
	createKeys,
	randomBytes,
	createHash,
	box,
	seal,
	sealOpen,
	boxOpen,
} from "../crypto"
import inquirer from "inquirer"
import signalhub from "signalhub"
import Peer from "simple-peer"
import wrtc from "wrtc"

function getPublicKeyId(publicKey: Buffer) {
	return createHash(publicKey).toString("base64")
}

type PublicChannelMessage =
	| { type: "seal"; payload: string }
	| { type: "box"; from: string; payload: string }

type PublicChannelMessagePayload =
	| InviteResponseMessage
	| InviteAckMessage
	| PeerSignal

type InviteResponseMessage = {
	type: "invite"
	password: string
	publicKey: string
}
type InviteAckMessage = { type: "invite-ack" }

type PeerSignal = {
	type: "signal"
	data: any
}

async function main() {
	const { identity } = await inquirer.prompt([
		{
			type: "input",
			name: "identity",
			message: "What identity do you want to use?",
		},
	])
	const identityPath = path.join(__dirname, "..", "identities", identity)
	await fs.mkdirp(identityPath)

	const publicKeyPath = path.join(identityPath, "public.key")
	const secretKeyPath = path.join(identityPath, "secret.key")

	let me: { publicKey: Buffer; secretKey: Buffer }
	if (!(await fs.pathExists(publicKeyPath))) {
		console.log("Generating keys.")
		me = createKeys()
		await fs.writeFile(publicKeyPath, me.publicKey)
		await fs.writeFile(secretKeyPath, me.secretKey)
	} else {
		me = {
			publicKey: await fs.readFile(publicKeyPath),
			secretKey: await fs.readFile(secretKeyPath),
		}
	}

	const friendsPath = path.join(identityPath, "friends.json")
	let friends: Record<string, string> = {}
	if (await fs.pathExists(friendsPath)) {
		friends = await fs.readJSON(friendsPath)
	}

	let { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What do you want to do?",
			choices: _.compact([
				"sendInvite",
				"acceptInvite",
				Object.keys(friends).length && "connectToSomeone",
				Object.keys(friends).length && "connectFromSomeone",
			]),
		},
	])

	const hub = signalhub("chets-p2p-prototype", [
		"https://signalhub-jccqtwhdwc.now.sh",
		// "https://signalhub-hzbibrznqa.now.sh",
	])

	if (action === "sendInvite") {
		const { name } = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Who are you inviting?",
			},
		])

		// Create an invite payload
		const password = randomBytes(32)
		const invite = Buffer.concat([password, me.publicKey]).toString("base64")

		console.log(`Send this payload to ${name}:`)
		console.log(invite)

		const publicKey = await new Promise<Buffer>(resolve => {
			const stream = hub.subscribe(getPublicKeyId(me.publicKey))
			stream.on("data", (message: PublicChannelMessage) => {
				if (message.type === "seal") {
					const data = sealOpen({
						payload: Buffer.from(message.payload, "base64"),
						to: me,
					})
					const result: PublicChannelMessagePayload = JSON.parse(
						data.toString("utf8")
					)
					if (result.type === "invite") {
						if (result.password === password.toString("base64")) {
							stream.destroy()
							resolve(Buffer.from(result.publicKey, "base64"))
						} else {
							console.error("wrong invite password")
						}
					} else {
						console.error("wrong public channel payload type")
					}
				} else {
					console.error("wrong public channel message type")
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
		hub.broadcast(getPublicKeyId(publicKey), channelMessage)

		friends[name] = publicKey.toString("base64")
		await fs.writeJSON(friendsPath, friends)

		// Listen for webrtc connection now.
		action = "connectFromSomeone"
	}

	if (action === "acceptInvite") {
		const { name } = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Who are you accepting this invite from?",
			},
		])

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

		console.log("Sending invite response to", name)
		hub.broadcast(getPublicKeyId(publicKey), channelMessage)

		await new Promise<void>(resolve => {
			const stream = hub.subscribe(getPublicKeyId(me.publicKey))
			stream.on("data", (message: PublicChannelMessage) => {
				if (message.type === "box") {
					if (message.from === getPublicKeyId(publicKey)) {
						const data = boxOpen({
							payload: Buffer.from(message.payload, "base64"),
							from: { publicKey },
							to: me,
						})
						const result: PublicChannelMessagePayload = JSON.parse(
							data.toString("utf8")
						)
						if (result.type === "invite-ack") {
							stream.destroy()
							resolve()
						} else {
							console.error("wrong payload type")
						}
					} else {
						console.error("message from the wrong person")
					}
				} else {
					console.error("wrong public channel message type")
				}
			})
		})

		friends[name] = publicKey.toString("base64")
		await fs.writeJSON(friendsPath, friends)

		// Try to connect via simple-peer
		action = "connectToSomeone"
	}

	function connect(name: string, initiator: boolean) {
		const publicKey = Buffer.from(friends[name], "base64")
		const peer = new Peer({ initiator, wrtc: wrtc })
		peer.on("signal", function(data) {
			const payload: PeerSignal = {
				type: "signal",
				data: data,
			}
			const message: PublicChannelMessage = {
				type: "box",
				from: getPublicKeyId(me.publicKey),
				payload: box({
					message: Buffer.from(JSON.stringify(payload), "utf8"),
					from: me,
					to: { publicKey },
				}).toString("base64"),
			}
			hub.broadcast(getPublicKeyId(publicKey), message)
		})

		const stream = hub.subscribe(getPublicKeyId(me.publicKey))
		stream.on("data", (message: PublicChannelMessage) => {
			if (message.type !== "box") {
				console.error("Wrong message type")
				return
			}
			if (message.from !== getPublicKeyId(publicKey)) {
				console.log("Wrong person")
				return
			}
			const result: PublicChannelMessagePayload = JSON.parse(
				boxOpen({
					payload: Buffer.from(message.payload, "base64"),
					from: { publicKey },
					to: me,
				}).toString("utf8")
			)
			if (result.type !== "signal") {
				console.log("wrong payload type")
				return
			}
			peer.signal(result.data)
			stream.destroy()
		})

		peer.on("connect", async () => {
			console.log("Connected!")
			while (true) {
				const { message } = await inquirer.prompt([
					{ type: "input", name: "message", message: "me>" },
				])
				peer.send(message)
			}
		})
		peer.on("data", data => {
			console.log(name + ">", data.toString("utf8"))
		})
		peer.on("close", () => {
			console.log("close")
		})
		peer.on("error", error => {
			console.log("error", error)
		})
		peer.on("end", () => {
			console.log("Disconnected!")
		})
	}

	if (action === "connectToSomeone") {
		const { name } = await inquirer.prompt([
			{
				type: "list",
				name: "name",
				message: "Who do you want to connect to?",
				choices: Object.keys(friends),
			},
		])
		connect(name, true)
	}

	if (action === "connectFromSomeone") {
		// TODO: we could accept from anyone if we want.
		const { name } = await inquirer.prompt([
			{
				type: "list",
				name: "name",
				message: "Who do you want to connect to?",
				choices: Object.keys(friends),
			},
		])
		connect(name, false)
	}
}

main()
