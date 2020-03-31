import * as React from "react"
import { Page, Heading, Button } from "./ui"

export function Welcome(props: {
	onNewIdentity?: () => void
	onImportIdentity?: () => void
}) {
	return (
		<Page>
			<Heading>Welcome to P2P Chat</Heading>
			<Button onClick={props.onNewIdentity}>Create a new identity</Button>
			<Button onClick={props.onImportIdentity}>Import identity</Button>
		</Page>
	)
}
