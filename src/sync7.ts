/*

https://gist.github.com/sid24rane/2b10b8f4b2f814bd0851d861d3515a10

TODO:
- debug the whole remotePort vs localPort thing.
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

const discovery = {
	a: 8001,
	b: 8002,
	c: 8003,
	d: 8004,
	e: 8005,
	f: 8006,
}

export class Source {
	private network: Network
	constructor(private port: number, private remotePorts: Array<number>) {
		this.network = new Network({
			port,
			remotePorts,
			onMessage: this.handleMessage,
			onConnect: this.handleConnect,
		})
	}

	private debug(...args: Array<any>) {
		console.log(`src:${this.port} |`, ...args)
	}

	start() {
		this.debug("start")
		this.network.start()
	}

	stop() {
		this.debug("stop")
		this.network.stop()
	}

	private log: Array<any> = []

	handleMessage = (socket: net.Socket, msg) => {
		if (msg.type === "sync") {
			this.debug("sync <=", socket.remotePort)
			if (msg.size < this.log.length) {
				this.debug("update =>", socket.remotePort)
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

	handleConnect = (socket: net.Socket) => {
		this.debug(
			"connect",
			socket.remoteAddress,
			socket.remotePort,
			socket.localAddress,
			socket.localPort
		)
	}

	write(item: string) {
		this.debug("write")
		const index = this.log.length
		this.log.push(item)
		this.network.broadcast({ type: "update", index, values: [item] })
	}
}

export class Sink {
	log: Array<any> = []

	private network: Network
	constructor(private port: number, remotePorts: Array<number>) {
		this.network = new Network({
			port,
			remotePorts,
			onMessage: this.handleMessage,
			onConnect: this.handleConnect,
		})
	}

	private debug(...args: Array<any>) {
		console.log(`snk:${this.port} |`, ...args)
	}
	start() {
		this.debug("start")
		this.network.start()
	}

	stop() {
		this.debug("stop")
		this.network.stop()
	}

	handleMessage = (socket: net.Socket, msg) => {
		if (msg.type === "update") {
			this.debug("update <=", socket.remotePort)
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
		this.debug(
			"connect",
			socket.remoteAddress,
			socket.remotePort,
			socket.localAddress,
			socket.localPort
		)
		this.sync(socket)
	}

	sync(socket: net.Socket) {
		this.debug("sync =>", socket.remotePort)
		socket.write(JSON.stringify({ type: "sync", size: this.log.length }))
	}
}

export class Network {
	private port: number
	private remotePorts: Array<number>
	private onMessage: (socket: net.Socket, msg: any) => void
	private onConnect: (socket: net.Socket) => void

	private server: net.Server | undefined
	private sockets = new Map<number, net.Socket>()

	constructor(args: {
		port: number
		remotePorts: Array<number>
		onMessage: (socket: net.Socket, msg: any) => void
		onConnect: (socket: net.Socket) => void
	}) {
		this.port = args.port
		this.remotePorts = args.remotePorts
		this.onMessage = args.onMessage
		this.onConnect = args.onConnect
	}

	start() {
		this.startServer()
		this.startClients()
	}

	stop() {
		if (this.server) {
			this.server.close()
			this.server = undefined
		}
		for (const socket of Array.from(this.sockets.values())) {
			socket.end()
			this.sockets = new Map()
		}
	}

	// Server to accept connections when others come online.
	startServer() {
		this.server = net.createServer()
		this.server.on("connection", socket => {
			const port = socket.remotePort!
			console.log("remote port", this.port, socket.remotePort, socket.localPort)
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
		this.server.listen(this.port)
	}

	// Clients to connect to sinks when coming online.
	startClients() {
		for (const port of this.remotePorts) {
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

const source = new Source(8001, [8002])
source.start()
const sink = new Sink(8002, [8001])
sink.start()

// source.write("hello")
// console.log(sink.log)
