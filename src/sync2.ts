// class Source<T> {
// 	private log: Array<T> = []
// 	write(item: T) {
// 		this.log.push(item)
// 	}

// }

// class Sink<T> {

// }

// The confusion here is because the source and sink are the socket and the program on both ends.
// And it depends who comes online first.

const source: any = new EventEmitter()
source.emit({ type: "start", id: "xx", size: this.log.length })

const sink: any = new EventEmitter()
sink.on("start", ({ id, size }) => {})

interface Connection {
	send(event: string, args: any): void
	receive(event: string, fn: (args: any) => void): () => void
}

class Source<T> {
	log: Array<T> = []
	connections: Set<Connection> = new Set()

	constructor(private id: string) {}

	connect(connection: Connection) {
		this.connections.add(connection)

		// Initiate sync.
		connection.send("")
	}

	write(value: T) {
		this.log.push(value)

		// Broadcast the update.
		for (const connection of Object.values(this.connections)) {
			connection.send("log-update", {
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
	constructor(private id: string) {}

	connect(connection: Connection) {
		this.connections.add(connection)

		// Initiate sync.
	}
}

// [
// 	{id: "x", type: "hello"} // a
// 	{id: "x", size: number} // b
// 	{id: "x", batch: Array<T>} // a
// ]

// function sync(a, b) {
// 	a.send({id: "x", size: 10})
// 	b.on(({id, size}) => {
// 		if (id)
// 	})
// }

// type Sync = [
// 	{id: string, size: number} // send status
// 	[
// 		{id: string, syncFrom: number} // ok sync

// 	]
// 	[
// 		{id: string, syncFrom: number} // ok sync
// 	]

// ]

// function thing(a, b) {
// 	[

// 		{
// 			event: "status",

// 			handle: ({id: stringify, size: number}) => {

// 			}
// 		}
// 	]
// 	a.send("status", {id: a.id, size: a.size})
// 	b.on("status", () => {

// 	})
// }

export default {}
