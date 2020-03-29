import * as readline from "readline"
import * as fs from "fs"
import * as net from "net"
import { loadLog, connect, serve } from "./shared"
import { argv } from "yargs"

const port = argv._[0]
const remotePorts = argv._.slice(1)

console.log("Server port:", port)
console.log("Client ports:", ...remotePorts)

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
const fileName = port + ".log"
const clients = new Set<net.Socket>()

function handleSocket(socket: net.Socket) {
	clients.add(socket)
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
	const server = serve(port, handleSocket)
	// Connect to known clients.
	const brokers = remotePorts.map(remotePort =>
		connect(remotePort, handleSocket)
	)

	while (true) {
		const item = await getItem()
		if (!item) {
			continue
		}
		log.push(item)
		await new Promise(resolve => fs.appendFile(fileName, item + "\n", resolve))
		for (const client of clients) {
			client.write(JSON.stringify({ values: [item] }))
		}
	}
}

main()
