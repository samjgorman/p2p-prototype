import * as React from "react"
import { Welcome, NewIdentity, ImportIdentity } from "./ui"

interface PlaygroundProps {}

const pages = { Welcome, NewIdentity, ImportIdentity }

interface PlaygroundState {
	page: keyof typeof pages
}

export class Design extends React.PureComponent<
	PlaygroundProps,
	PlaygroundState
> {
	state: PlaygroundState = { page: "Welcome" }

	render() {
		if (this.state.page === "Welcome") {
			return (
				<Welcome
					onNewIdentity={() => this.setState({ page: "NewIdentity" })}
					onImportIdentity={() => this.setState({ page: "ImportIdentity" })}
				/>
			)
		} else if (this.state.page === "NewIdentity") {
			return (
				<NewIdentity
					onCancel={() => this.setState({ page: "Welcome" })}
					onSubmit={() => this.setState({ page: "Welcome" })}
				/>
			)
		} else if (this.state.page === "ImportIdentity") {
			return <ImportIdentity />
		}
	}
}
