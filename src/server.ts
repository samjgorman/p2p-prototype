import * as readline from "readline"
import * as fs from "fs"
import * as net from "net"
import { loadLog, serverServe, serverConnect } from "./shared"

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

async function getItem() {
	return new Promise<string>(resolve => {
		rl.question("> ", resolve)
	})
}

const log: Array<string> = []
const fileName = "8000.log"
const clients = new Set<net.Socket>()

async function main() {
	log.push(...(await loadLog(fileName)))
	for (const item of log) {
		console.log(">", item)
	}

	serverServe({ log, clients, port: 8000 })
	serverConnect({ log, clients, remotePort: 8001 })

	while (true) {
		const item = await getItem()
		log.push(item)
		await new Promise(resolve => fs.appendFile(fileName, item + "\n", resolve))
		for (const client of clients) {
			client.write(JSON.stringify({ values: [item] }))
		}
	}
}

main()
