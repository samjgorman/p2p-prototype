console.log("1")
import electron from "electron"
console.log("2")
import * as path from "path"
console.log("3")
import * as fs from "fs"
console.log("4")
import { createSQLiteDatabase } from "./sqlite"
console.log("5")
import { createKeys, randomBytes } from "./crypto"
console.log("6")
import { randomId } from "../shared/randomId"

console.log("2")
const userDataPath = path.join(electron.app.getPath("userData"), "p2pchat")
console.log("userDataPath", userDataPath)

const pubicKeyPath = path.join(userDataPath, "public.key")
const secretKeyPath = path.join(userDataPath, "secret.key")

// Load or create identity keys.
let me: { publicKey: Buffer; secretKey: Buffer }
if (!fs.existsSync(pubicKeyPath)) {
	me = createKeys()
} else {
	me = {
		publicKey: fs.readFileSync(pubicKeyPath),
		secretKey: fs.readFileSync(secretKeyPath),
	}
}

// Create the database.
const sqlitePath = path.join(userDataPath, "p2pchat.db")
const db = createSQLiteDatabase(sqlitePath)

const api = {
	openExternalUrl(url: string) {
		electron.shell.openExternal(url)
	},
	createFriend(args: { name: string }) {
		const id = randomId()
		const invite_code = getInviteCode({
			password: randomBytes(32),
			publicKey: me.publicKey,
		})
		db.createFriend({
			id: id,
			name: args.name,
			invite_code: invite_code,
			public_key: undefined,
		})
		return { id }
	},
	getFriend(args: { id: string }) {
		return db.getFriend(args)
	},
	getFriends() {
		return db.getFriends()
	},
	acceptInvite(args: { id: string; invite_code: string }) {
		Buffer.from(args.invite_code)
		// const password = token.slice(0, 32).toString("base64")
		// const publicKey = token.slice(32)
	},
	// createMessage(args: Message): void {},
	// getMessages(chatroom_id: string): Array<Message> {},
}

export type Api = typeof api

electron.app["api"] = api

function getInviteCode(args: { password: Buffer; publicKey: Buffer }) {
	return Buffer.concat([args.password, args.publicKey]).toString("base64")
}
