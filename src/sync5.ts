import * as express from "express"
import * as bodyParser from "body-parser"

const sourcePort = 8001
const sinkPort = 8002

// Source
const log: Array<any> = []

class Source {
	log: Array<any> = []

	constructor() {
		const app = express()
		app.use(bodyParser.json())
		app.post("sync", (req, res) => {
			const args = req.body as { size: number }
			// Kind of weird not using p2p...

			// if (size < this.log.length) {
			// 	sink.send("update", { index: size, values: this.log.slice(size) })
			// }
		})
	}
}
