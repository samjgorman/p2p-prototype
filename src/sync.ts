import * as fs from "fs-extra"
import * as readline from "readline"

/*
Plan

- first, just record text input from a cli application.
	- print with username (from cli args) and timestamp
	https://github.com/Yomguithereal/react-blessed
- persist log to disk
- broadcast log to another place.
- chatrooms
- connect and sync two log files. Interleave messages by timestamp
	- simple-peer + signalhub.
	- dht, mdns, ble

*/

const logsDir = __dirname + "/../"
function createLogFile(logName: string) {
	return {
		async read() {
			const log = await fs.readFile(logsDir + logName + ".log", "utf8")
			return log.split("\n")
		},
		async write(item: string) {
			await fs.appendFile(logsDir + logName + ".log", item + "\n", {
				encoding: "utf8",
			})
		},
	}
}

console.log(process.argv)

async function recordLogFromCommandline() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	while (true) {
		const answer = await new Promise<string>(resolve =>
			rl.question("> ", resolve)
		)
		rl.write("", { ctrl: true, name: "u" })
	}
	rl.close()
}

recordLogFromCommandline()
// type Log = ReturnType<typeof createLogFile>

// const log = new EventEmitter()
// log.on("connect", connection => {})

// const a: any = {}
// const b: any = {}

// a.write = item => {
// 	a.log.write(item)
// 	for (const other of a.directory.wants.a) {
// 	}
// }

// a.on("want", (conn, logName) => {
// 	a.wants[logName].push(conn)
// })
