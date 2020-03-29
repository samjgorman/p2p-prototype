- use signalhub + simple peer
	- UserA sends {publicKeyA, password} unencrypted to UserB out of band.
	- UserB discovers UserA via hash(publicKeyA)
	- UserB sends seal({publicKeyB, password})

sealOpen error?

- consider using hyperswarm/network to announce and lookup peers


https://security.stackexchange.com/questions/228893/how-to-mitigate-mitm-attack-on-webrtc-with-an-untrusted-signaling-channel

- Create a general abstraction for a "socket"
	- Can we use simple-peer?
	- Can we do everything in-memory?
	- Can we sync messages across electron IPC?

- Basic discovery mechanism with no auth
- Queries / reducers (basically redux)
- Auth -> P2P chat!
