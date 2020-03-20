import * as discovery from "@hyperswarm/discovery"
import * as crypto from "crypto"

const appName = "p2p discovery test"
console.log("APPNAME", appName)

const args = process.argv.slice(2)
const port = parseInt(args[0])
console.log("PORT", port)

const d = discovery()
const key = crypto
	.createHash("sha256")
	.update(appName)
	.digest()

console.log("KEY", key)

const ann = d.announce(key, { port })

const lookup = d.lookup(key)

// emitted when a peer is found
lookup.on("peer", peer => {
	console.log("PEER", peer)
})
