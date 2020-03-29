import * as React from "react"
import { Route } from "../helpers/routeHelpers"
import { api } from "../api"

interface WelcomeProps {
	navigate(route: Route): void
}

// Create a new identity
// - generate a new key
// - or upload an existing key
// Select an existing identity.

type WelcomeState =
	| {
			type: "root"
	  }
	| {
			type: "generate"
			name: string
	  }

export class Welcome extends React.PureComponent<WelcomeProps> {
	render() {
		// const identities = api.listIdentities()
		const identities = []
		if (identities.length === 0) {
			return (
				<div>
					<h1>Welcome!</h1>
					<p>
						Please <button onClick={this.handleUpload}>upload</button> your
						keys.
					</p>
					<p>
						Or <button onClick={this.handleGenerate}>generate</button> a new
						one!
					</p>
					<p>Or choose an existing identity:</p>
				</div>
			)
		}

		return (
			<div>
				<h1>Welcome!</h1>
				<p>
					Please <button onClick={this.handleUpload}>upload</button> your keys.
				</p>
				<p>
					Or <button onClick={this.handleGenerate}>generate</button> a new one!
				</p>
				<p>Or choose an existing identity:</p>
			</div>
		)
	}

	private handleUpload = () => {
		alert("This doesn't work yet!")
	}

	private handleGenerate = () => {
		alert("This doesn't work yet!")
	}
}
