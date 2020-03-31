import * as React from "react"
import { ImportIdentity } from "./ImportIdentity"
import { NewIdentity } from "./NewIdentity"
import { Welcome } from "./Welcome"
import { ChatApp } from "./ChatApp"

interface PlaygroundProps {}

interface PlaygroundState {
	page: "Welcome" | "NewIdentity" | "ImportIdentity" | "ChatApp"
}

export class Design extends React.PureComponent<
	PlaygroundProps,
	PlaygroundState
> {
	state: PlaygroundState = { page: "ChatApp" }

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
			return (
				<ImportIdentity
					onCancel={() => this.setState({ page: "Welcome" })}
					onSubmit={() => this.setState({ page: "Welcome" })}
				/>
			)
		} else if (this.state.page === "ChatApp") {
			return <ChatApp me="Chet" friends={[]} identities={["Chet"]} />
		}
	}
}
