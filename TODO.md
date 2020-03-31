Build a basic chat app with Electron
Follow the mocks here:  https://whimsical.com/VPLPUCwCG9cwHuCkNyTQpo


- keep mocking out https://whimsical.com/VPLPUCwCG9cwHuCkNyTQpo
- create design route
	- use file menu to navigate between them
- proper form elements?
- click handlers to navigate between views
- wire up the actual application
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

