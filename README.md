# P2P Sync Prototype

**Goal:** Create a simple and secure P2P sync prototype.

- Using `libsodium` for creating key-pairs for identity and encryption.
- Using `simple-peer` for WebRTC.
- Using `signalhub` as a public discovery channel for WebRTC.
	- Consider using mDNS, BLE, WiFi Direct, and DHT.
	- Consider using `@hyperswarm/discovery`.
	- Consider using `libp2p`.

WebRTC says it can set up a secure channel, but is vulnerable to MITM if the discovery channel is insecure. I'm assuming that encrypting the signaling packets should solve that issue.

### [WIP] Set up guide:

1. Run node app.js in the build directory to open a peer connection.
2. Open another peer connection with node app.js on another process or machine.
3. Exchange secure hashes as prompted to instantiate a connection and begin talking.


