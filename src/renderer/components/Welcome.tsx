import * as React from "react"
import { Route } from "../helpers/routeHelpers"

interface WelcomeProps {
	navigate(route: Route): void
}

export class Welcome extends React.PureComponent<WelcomeProps> {
	render() {
		return (
			<div>
				<h1>Welcome!</h1>
				<p>
					Please <button onClick={this.handleUpload}>upload</button> your keys.
				</p>
				<p>
					Or <button onClick={this.handleGenerate}>generate</button> a new one!
				</p>
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
