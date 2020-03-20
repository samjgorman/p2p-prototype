/*

https://gist.github.com/sid24rane/2b10b8f4b2f814bd0851d861d3515a10

TODO:
- test out that this thing even works.
	- write out a test!
- persist log to disk
	- create a simple CLI for this stuff.
- sync logs n-ways.
	- chat app. think about causality.

Goal:
- optionally synchronous and in-memory -- network entirely abstracted


*/

import * as net from "net"

const ports = [8001, 8002, 8003, 8004, 8005, 8006]

export class Source {
	private connections: ConnnectionManager
	constructor(private port: number) {
		this.connections = new ConnnectionManager({
			port,
			ports,
			onMessage: this.handleMessage,
			onConnect: () => null,
		})
	}

	private log: Array<any> = []

	handleMessage = (socket: net.Socket, msg) => {
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
		this.connections.broadcast({ type: "update", index, values: [item] })
	}
}

export class Sink {
	log: Array<any> = []

	private connections: ConnnectionManager
	constructor(private port: number) {
		this.connections = new ConnnectionManager({
			port,
			ports,
			onMessage: this.handleMessage,
			onConnect: this.handleConnect,
		})
	}

	handleMessage = (socket: net.Socket, msg) => {
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

	handleConnect = (socket: net.Socket) => {
		this.sync(socket)
	}

	sync(socket: net.Socket) {
		socket.write(JSON.stringify({ type: "sync", size: this.log.length }))
	}
}

export class ConnnectionManager {
	private port: number
	private ports: Array<number>
	private onMessage: (socket: net.Socket, msg: any) => void
	private onConnect: (socket: net.Socket) => void

	constructor(args: {
		port: number
		ports: Array<number>
		onMessage: (socket: net.Socket, msg: any) => void
		onConnect: (socket: net.Socket) => void
	}) {
		this.port = args.port
		this.ports = args.ports
		this.onMessage = args.onMessage
		this.onConnect = args.onConnect
	}

	private sockets = new Map<number, net.Socket>()

	// Server to accept connections when others come online.
	startServer() {
		var server = net.createServer()
		server.on("connection", socket => {
			const port = socket.remotePort!
			if (this.sockets.has(port)) {
				console.warn("Client connection already exists!")
			}
			this.sockets.set(port, socket)

			this.onConnect(socket)

			socket.setEncoding("utf8")
			socket.on("data", data => {
				const msg = JSON.parse(data.toString("utf8"))
				this.onMessage(socket, msg)
			})
			socket.on("close", error => {
				this.sockets.delete(port)
			})
		})
		server.listen(this.port)
	}

	// Clients to connect to sinks when coming online.
	startClients() {
		for (const port of this.ports) {
			var socket = new net.Socket()
			socket.setEncoding("utf8")
			socket.connect({ port })
			socket.on("connect", () => {
				if (this.sockets.has(port)) {
					console.warn("Server connection already exists!")
				}
				this.sockets.set(port, socket)
				this.onConnect(socket)
			})
			socket.on("data", data => {
				const msg = JSON.parse(data.toString("utf8"))
				this.onMessage(socket, msg)
			})
			socket.on("close", () => {
				this.sockets.delete(port)
			})
		}
	}

	broadcast(msg) {
		for (const socket of Array.from(this.sockets.values())) {
			socket.write(JSON.stringify(msg))
		}
	}
}
