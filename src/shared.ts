import * as fs from "fs"
import * as net from "net"

export async function loadLog(fileName: string): Promise<Array<string>> {
	const contents = await new Promise<string>(resolve =>
		fs.readFile(fileName, "utf8", (err, data) => resolve(data))
	)
	if (contents) {
		const items = contents.split("\n")
		return items
	} else {
		return []
	}
}

export function serverServe(args: {
	clients: Set<net.Socket>
	log: Array<string>
	port: number
}) {
	const { clients, log, port } = args
	const server = net.createServer()
	server.on("connection", client => {
		clients.add(client)
		client.on("data", data => {
			const body = JSON.parse(data.toString("utf8"))
			if (body.size < log.length) {
				client.write(JSON.stringify({ values: log.slice(body.size) }))
			} else {
				client.write(JSON.stringify({ values: [] }))
			}
		})
		client.on("close", () => {
			clients.delete(client)
		})
	})
	server.listen(port)
}

export function serverConnect(args: {
	log: Array<string>
	remotePort: number
	clients: Set<net.Socket>
}) {
	const { remotePort, log, clients } = args
	try {
		const socket = new net.Socket()
		socket.connect(remotePort, "localhost", function() {
			serverHandleSocket({
				socket,
				log,
				clients,
			})
		})
		socket.on("error", function() {
			// ignore error.
		})
		clients.add(socket)
	} catch (error) {}
}

function serverHandleSocket(args: {
	socket: net.Socket
	log: Array<string>
	clients: Set<net.Socket>
}) {
	const { socket, log, clients } = args
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

function clientHandleSocket(args: {
	socket: net.Socket
	log: Array<string>
	fileName: string
}) {
	const { socket, log, fileName } = args
	socket.write(JSON.stringify({ size: log.length }))

	socket.on("data", async function(data) {
		const body = JSON.parse(data.toString("utf8"))

		log.push(...body.values)

		if (body.values.length > 0) {
			for (const item of body.values) {
				console.log(">", item)
			}
			await new Promise(resolve =>
				fs.appendFile(fileName, body.values.join("\n") + "\n", resolve)
			)
		}
	})

	socket.on("close", function() {
		socket.destroy()
	})
	socket.on("error", function() {
		socket.destroy()
	})
}

export async function clientConnect(args: {
	fileName: string
	log: Array<string>
	remotePort: number
}) {
	try {
		const { fileName, log, remotePort } = args
		const socket = new net.Socket()
		socket.connect(remotePort, "localhost", function() {
			clientHandleSocket({
				socket,
				fileName,
				log,
			})
		})
		socket.on("error", function() {
			// Ignore error.
		})
	} catch (error) {
		console.log("HERE")
	}
}

export async function clientServe(args: {
	fileName: string
	log: Array<string>
	port: number
}) {
	const { fileName, log, port } = args
	const server = net.createServer()
	server.on("connection", socket => {
		clientHandleSocket({
			socket,
			log,
			fileName,
		})
	})
	server.listen(port)
}
