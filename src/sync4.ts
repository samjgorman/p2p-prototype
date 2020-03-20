export default {}

interface Connection {
	send(event: string, args?: any): void
	receive(event: string, fn: (other: Connection, args: any) => void): () => void
}

class Source<T> {
	log: Array<T> = []
	connections: Set<Connection> = new Set()

	constructor(private id: string, private connection: Connection) {
		// Setup listener for sync initation.
		connection.receive("hello", (sink: Connection, { size }) => {
			if (size < this.log.length) {
				sink.send("update", { index: size, values: this.log.slice(size) })
			}
		})
	}

	connect(connection: Connection) {
		this.connections.add(connection)

		// Initiate sync.
		connection.send("hello", { size: this.log.length })
	}

	write(value: T) {
		this.log.push(value)

		// Broadcast the update.
		for (const connection of Object.values(this.connections)) {
			connection.send("update", {
				id: this.id,
				size: this.log.length,
				value: value,
			})
		}
	}
}

class Sink<T> {
	log: Array<T> = []
	connections: Set<Connection> = new Set()

	constructor(private id: string, private connection: Connection) {
		// Setup sync initiation listener.
		connection.receive("hello", (src, { size }) => {
			if (size > this.log.length) {
				src.send("hello", { size: this.log.length })
			}
		})
		// Handle update.
		connection.receive("update", (src, { index, values }) => {
			this.log.splice(index).push(...values)
		})
	}

	connect(connection: Connection) {
		this.connections.add(connection)

		// Initiate sync.
		connection.send("hello", { size: this.log.length })
	}
}

// simple-peer connection
// signalhub, mdns discovery, dht, ble discovery

// list of peers known peers
// connect when they're online
// sync logs
// chat window.
