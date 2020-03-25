import * as readline from "readline"
import * as fs from "fs"
import * as net from "net"
import { loadLog, connect, serve } from "./shared"

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

async function getItem() {
	return new Promise<string>(resolve => {
		rl.question("> ", resolve)
	})
}

const log: Array<string> = []
const fileName = "8000.log"
const clients = new Set<net.Socket>()

function handleSocket(socket: net.Socket) {
	socket.on("data", data => {
		const body = JSON.parse(data.toString("utf8"))
		if (body.size < log.length) {
			socket.write(JSON.stringify({ values: log.slice(body.size) }))
		} else {
			socket.write(JSON.stringify({ values: [] }))
		}
	})
	socket.on("close", () => {
		clients.delete(socket)
	})
}

async function main() {
	log.push(...(await loadLog(fileName)))
	for (const item of log) {
		console.log(">", item)
	}

	// Become discoverable to clients.
	const server = serve(8000, handleSocket)
	// Connect to known clients.
	const broker = connect(8001, handleSocket)

	while (true) {
		const item = await getItem()
		log.push(item)
		await new Promise(resolve => fs.appendFile(fileName, item + "\n", resolve))
		for (const client of clients) {
			client.write(JSON.stringify({ values: [item] }))
		}
	}
}

main()
