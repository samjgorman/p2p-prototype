import sqlite from "better-sqlite3"

const bootup = [
	`
	CREATE TABLE IF NOT EXISTS friends (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		invite_code TEXT,
		public_key TEXT
	)
	`,
	`
	CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
		friend_id TEXT NOT NULL, -- friend.id for now.
		incoming BOOLEAN NOT NULL,
		message TEXT NOT NULL,
		created_at TEXT NOT NULL
	)
	`,
]

export interface Friend {
	id: string
	name: string
	invite_code?: string
	public_key?: string
}

export interface Message {
	id: string
	friend_id: string
	incoming: boolean
	message: string
	created_at: string // ISO UTC time.
}

interface Database {
	createFriend(args: Friend): void
	getFriend(args: { id: string }): Friend
	getFriends(): Array<Friend>
	findinvite_code(args: { invite_code: string }): Friend
	savePublicKey(args: { id: string; public_key: string }): void
	createMessage(args: Message): void
	getMessages(args: { friend_id: string }): Array<Message>
}

export function createSQLiteDatabase(dbPath: string): Database {
	const db = sqlite(dbPath)
	for (const cmd of bootup) {
		db.prepare(cmd).run()
	}

	const createFriend = db.prepare(`
		INSERT INTO friend (id, name, invite_code, public_key)
		VALUES ($id, $name, $invite_code, $public_key)
	`)

	const getFriend = db.prepare(`
		SELECT * from friend
		WHERE id = $id
	`)

	const getFriends = db.prepare(`
		SELECT * from friend
	`)

	const findinvite_code = db.prepare(`
		SELECT * from friend
		WHERE invite_code = $invite_code
	`)

	const savePublicKey = db.prepare(`
		UPDATE friend
		SET public_key = $public_key
		WHERE id = $id
	`)

	const createMessage = db.prepare(`
		INSERT INTO message (id, friend_id, incoming, message, created_at)
		VALUES ($id, $friend_id, $incoming, $message, $created_at)
	`)

	const getMessages = db.prepare(`
		SELECT * FROM message
		WHERE friend_id = $friend_id
		ORDER BY created_at DESC
	`)

	return {
		createFriend(args) {
			createFriend.run(args)
		},
		getFriend({ id }) {
			return getFriend.get({ id })
		},
		getFriends() {
			return getFriends.all()
		},
		findinvite_code({ invite_code }) {
			return findinvite_code.get({ invite_code })
		},
		savePublicKey({ id, public_key }) {
			savePublicKey.run({ id, public_key })
		},
		createMessage(message) {
			createMessage.run(message)
		},
		getMessages({ friend_id }) {
			return getMessages.all({ friend_id })
		},
	}
}
