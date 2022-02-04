import * as net from "net"
import * as fs from "fs"
import { loadLog, connect, serve } from "./shared"
import { argv } from "yargs"

const port = argv._[0]
const remotePort = argv._[1]

console.log("Client port:", port)
console.log("Server port:", remotePort)

const log: Array<string> = []
const fileName = port + ".log"

function handleSocket(socket: net.Socket) {
	socket.write(JSON.stringify({ size: log.length }))
	socket.on("data", async function (data) {
		const body = JSON.parse(data.toString("utf8"))

		log.push(...body.values)

		if (body.values.length > 0) {
			for (const item of body.values) {
				console.log(">", item)
			}
			await new Promise((resolve) =>
				fs.appendFile(fileName, body.values.join("\n") + "\n", resolve)
			)
		}
	})

	socket.on("close", function () {
		socket.destroy()
	})
	socket.on("error", function () {
		socket.destroy()
	})
}

async function main() {
	log.push(...(await loadLog(fileName)))
	for (const item of log) {
		console.log(">", item)
	}

	// Become discoverable to servers.
	const server = serve(port, handleSocket)
	// Connect to known servers.
	const broker = connect(remotePort, handleSocket)
}

main()
