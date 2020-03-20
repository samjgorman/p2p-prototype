/*

https://gist.github.com/sid24rane/2b10b8f4b2f814bd0851d861d3515a10

TODO:
- test out that this thing even works.
- persist log to disk
- create more than one sink.
- abstract away the connection stuff from the log sync.
- sync logs n-ways. chat app.


*/

import * as net from "net"

const sourcePort = 8001
const sinkPort = 8002

export class Source {
	log: Array<any> = []

	constructor() {}

	connections = new Set<net.Socket>()

	// Server to accept connections from sinks when they come online.
	startServer() {
		var server = net.createServer()
		server.on("connection", socket => {
			this.connections.add(socket)
			socket.setEncoding("utf8")
			socket.on("data", data => {
				const msg = JSON.parse(data.toString("utf8"))
				this.onMessage(socket, msg)
			})
			socket.on("close", error => {
				this.connections.delete(socket)
			})
		})
		server.listen(sourcePort)
	}

	// Clients to connect to sinks when coming online.
	startClients() {
		for (const port of [sinkPort]) {
			var socket = new net.Socket()
			socket.setEncoding("utf8")
			socket.connect({ port })
			socket.on("connect", () => {
				this.connections.add(socket)
			})
			socket.on("data", data => {
				const msg = JSON.parse(data.toString("utf8"))
				this.onMessage(socket, msg)
			})
			socket.on("close", () => {
				this.connections.delete(socket)
			})
		}
	}

	onMessage(socket: net.Socket, msg) {
		if (msg.type === "sync") {
			if (msg.size < this.log.length) {
				socket.write(
					JSON.stringify({
						type: "update",
						index: msg.size,
						values: this.log.slice(msg.size),
					})
				)
			}
		}
	}

	write(item: string) {
		const index = this.log.length
		this.log.push(item)
		for (const connection of Array.from(this.connections)) {
			connection.write(
				JSON.stringify({ type: "update", index, values: [item] })
			)
		}
	}
}

export class Sink {
	log: Array<any> = []

	constructor() {}

	connections = new Set<net.Socket>()

	// Server to accept connections from source when they come online.
	startServer() {
		var server = net.createServer()
		server.on("connection", socket => {
			this.connections.add(socket)
			socket.setEncoding("utf8")
			socket.on("data", data => {
				const msg = JSON.parse(data.toString("utf8"))
				this.onMessage(socket, msg)
			})
			socket.on("close", error => {
				this.connections.delete(socket)
			})
			// Initiate sync.
			this.sync(socket)
		})
		server.listen(sinkPort)
	}

	// Cleints to initiate connection to source when coming online
	startClients() {
		for (const port of [sourcePort]) {
			var socket = new net.Socket()
			socket.setEncoding("utf8")
			socket.connect({ port })
			socket.on("connect", () => {
				this.connections.add(socket)
				// Initiate sync.
				this.sync(socket)
			})
			socket.on("data", data => {
				const msg = JSON.parse(data.toString("utf8"))
				this.onMessage(socket, msg)
			})
			socket.on("close", () => {
				this.connections.delete(socket)
			})
		}
	}

	sync(socket: net.Socket) {
		socket.write(JSON.stringify({ type: "sync", size: this.log.length }))
	}

	onMessage(socket: net.Socket, msg) {
		if (msg.type === "update") {
			if (msg.index > this.log.length) {
				// Out of sync.
				this.sync(socket)
			} else if (msg.index + msg.values.length > this.log.length) {
				// Write values.
				this.log.splice(msg.index).push(...msg.values)
			}
		}
	}

	write(item: string) {
		const index = this.log.length
		this.log.push(item)
		for (const connection of Array.from(this.connections)) {
			connection.write(
				JSON.stringify({ type: "update", index, values: [item] })
			)
		}
	}
}
