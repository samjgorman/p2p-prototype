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

export function serve(port: number, onConnection: (socket: net.Socket) => any) {
	const server = net.createServer()
	server.on("connection", onConnection)
	server.listen(port)
	return { stop: () => server.close() }
}

export function connect(
	port: number,
	onConnection: (socket: net.Socket) => any
) {
	const socket = new net.Socket()
	socket.connect(port, "localhost", function() {
		onConnection(socket)
	})
	socket.on("error", function() {
		// Ignore error.
	})
	socket.on("close", function() {
		// Reconnect?
	})

	return {
		stop: () => {
			socket.destroy()
		},
	}
}
