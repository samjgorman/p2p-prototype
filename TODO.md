
- Sync a log from one place to another.
	- CLI args for what ports to sync to/from.
	- How to reconnect when going offline?

- Create a general abstraction for a "socket"
	- Can we use simple-peer?
	- Can we do everything in-memory?
	- Can we sync messages across electron IPC?

- Basic discovery mechanism with no auth
- Queries / reducers (basically redux)
- Auth -> P2P chat!

This test seems to work:
./node_modules/.bin/ts-node src/server.ts 8000 8001 8002
./node_modules/.bin/ts-node src/client.ts 8001 8000
./node_modules/.bin/ts-node src/client.ts 8002 8000