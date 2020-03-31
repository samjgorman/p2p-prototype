import sqlite from "better-sqlite3"

const bootup = [
	`
	CREATE TABLE IF NOT EXISTS friends (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		password TEXT,
		public_key TEXT
	)
	`,
	`
	CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
		chatroom_id TEXT NOT NULL, -- friend.id for now.
		from_id TEXT NOT NULL,
		to_id TEXT NOT NULL,
		message TEXT NOT NULL
	)
	`,
]

interface Friend {
	id: string
	name: string
	password?: string
	public_key?: string
}

interface Message {
	id: string
	chatroom_id: string
	from_id: string
	to_id: string
	message: string
	created_at: string // ISO UTC time.
}

interface Database {
	createFriend(args: Friend): void
	getFriend(id: string): Friend
	getFriends(): Array<Friend>
	findPassword(password: string): Friend
	savePublicKey(args: { id: string; public_key: string }): void
	createMessage(args: Message): void
	getMessages(chatroom_id: string): Array<Message>
}

export function createSQLiteDatabase(dbPath: string): Database {
	const db = sqlite(dbPath)
	for (const cmd of bootup) {
		db.prepare(cmd).run()
	}

	const createFriend = db.prepare(`
		INSERT INTO friend (id, name, password, public_key)
		VALUES ($id, $name, $password, $public_key)
	`)

	const getFriend = db.prepare(`
		SELECT * from friend
		WHERE id = $id
	`)

	const getFriends = db.prepare(`
		SELECT * from friend
	`)

	const findPassword = db.prepare(`
		SELECT * from friend
		WHERE password = $password
	`)

	const savePublicKey = db.prepare(`
		UPDATE friend
		SET public_key = $public_key
		WHERE id = $id
	`)

	const createMessage = db.prepare(`
		INSERT INTO message (id, chatroom_id, from_id, to_id, message, created_at)
		VALUES ($id, $chatroom_id, $from_id, $to_id, $message, $created_at)
	`)

	const getMessages = db.prepare(`
		SELECT * FROM message
		WHERE chatroom_id = $chatroom_id
		ORDER BY created_at DESC
	`)

	return {
		createFriend(args) {
			createFriend.run(args)
		},
		getFriend(id: string) {
			return getFriend.get({ id })
		},
		getFriends() {
			return getFriends.all()
		},
		findPassword(password) {
			return findPassword.get({ password })
		},
		savePublicKey({ id, public_key }) {
			savePublicKey.run({ id, public_key })
		},
		createMessage(message) {
			createMessage.run(message)
		},
		getMessages(chatroom_id) {
			return getMessages.all({ chatroom_id })
		},
	}
}
