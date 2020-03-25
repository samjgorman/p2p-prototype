import { loadLog, clientConnect, clientServe } from "./800x"

const log: Array<string> = []
const fileName = "8001.log"

async function main() {
	log.push(...(await loadLog(fileName)))
	for (const item of log) {
		console.log(">", item)
	}

	clientServe({ fileName, log, port: 8001 })
	clientConnect({ fileName, log, remotePort: 8000 })
}

main()
