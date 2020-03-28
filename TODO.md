
- Sync a log from one place to another.
	- CLI args for what ports to sync to/from.
	- How to reconnect when going offline?

This test seems to work:
./node_modules/.bin/ts-node src/server.ts 8000 8001 8002
./node_modules/.bin/ts-node src/client.ts 8001 8000
./node_modules/.bin/ts-node src/client.ts 8002 8000

- Check out lookup and announce logic
	https://github.com/hyperswarm/hyperswarm
	https://github.com/hyperswarm/discovery
	https://github.com/mafintosh/noise-network
	https://github.com/mafintosh/p2p-file-sharing-workshop

- Seems like we could just use TLS for encryption + authentication.
	https://nodejs.org/docs/latest/api/tls.html
	https://gist.github.com/pcan/e384fcad2a83e3ce20f9a4c33f4a13ae
	Looks like we can use self-signed certificates without needing a verificate authority.
	https://flaviocopes.com/express-https-self-signed-certificate/


- Identity:
	- Every user gets has a Ed25519 public/private key.

- Introduction:
	- I create a password (random bytes)
		- optional ttl, optional note about who it's intended for.
	- I send my public key along with the password to the person out-of-band.
	- Other person finds me based on the hash of my public key.
	- Other person forms a secure channel - Diffie Helman + the thing to make sure there's no MITM.
	- Other person sends me the password with his public key.
	- Expire the password.
	- Hmm... Are we even using the public/private key? except to prove identity I suppose.


- Create a general abstraction for a "socket"
	- Can we use simple-peer?
	- Can we do everything in-memory?
	- Can we sync messages across electron IPC?

- Basic discovery mechanism with no auth
- Queries / reducers (basically redux)
- Auth -> P2P chat!
