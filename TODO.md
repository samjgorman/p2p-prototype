SQLite is tricky
- we have to figure out reactivity
- we have to figure out streaming p2p
- maybe its worth it to clean up the datalog stuff and jump right there?

---

Build a basic chat app with Electron
Follow the mocks here:  https://whimsical.com/VPLPUCwCG9cwHuCkNyTQpo

I think its time to dump this design file things and just build it...

- keep mocking out https://whimsical.com/VPLPUCwCG9cwHuCkNyTQpo
- abstraction for persisting data to disk.


- Is this strategy secure?
	https://security.stackexchange.com/questions/228893/how-to-mitigate-mitm-attack-on-webrtc-with-an-untrusted-signaling-channel

- Create a general abstraction for a "socket"
	- Can we use simple-peer?
	- Can we do everything in-memory?
	- Can we sync messages across electron IPC?

- Basic discovery mechanism with no auth
- Queries / reducers (basically redux)
- Auth -> P2P chat!

- consider using hyperswarm/network to announce and lookup peers



ideas:
- event log is synced.
- consume event log to build indexes.
- chat window html is an index

