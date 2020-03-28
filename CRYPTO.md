- Identity:
	- Every user gets has a Ed25519 public/private key generated by libsodium.

- Introduction:
	- I create a password (random bytes, optional ttl, optional note about who it's for)
	- I send my public key along with the password to the person out-of-band.
	- Other person finds me based on the hash of my public key.
	-

UserA
	PKA/SKA
UserB
	PKB/SKB

UserA -> (Password + PKA) -> UserB (out of band)
UserB -> HASH(PKA) -> PKA(PKB,SKB(Password))

PKA({PKB, Password})