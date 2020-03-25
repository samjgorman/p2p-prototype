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
	server.on("connection", socket => {
		serverHandleSocket({ socket, log, clients })
	})
	server.listen(port)
}

export async function serverConnect(args: {
	log: Array<string>
	remotePort: number
	clients: Set<net.Socket>
}) {
	const { remotePort, log, clients } = args
	const socket = await connect({ remotePort })
	if (!socket) {
		return
	}
	serverHandleSocket({
		socket,
		log,
		clients,
	})
}

function serverHandleSocket(args: {
	socket: net.Socket
	log: Array<string>
	clients: Set<net.Socket>
}) {
	const { socket, log, clients } = args
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
	const { fileName, log, remotePort } = args
	const socket = await connect({ remotePort })
	if (!socket) {
		return
	}
	clientHandleSocket({
		socket,
		fileName,
		log,
	})
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

export async function connect(args: { remotePort: number }) {
	return new Promise<net.Socket | undefined>(resolve => {
		const socket = new net.Socket()
		socket.connect(args.remotePort, "localhost", function() {
			resolve(socket)
		})
		socket.on("error", function() {
			resolve(undefined)
		})
	})
}
