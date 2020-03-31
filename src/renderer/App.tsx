import "./app.css"
import * as React from "react"
import { Router } from "./components/Router"
import { Root } from "./components/Root"
import { Welcome } from "./components/Welcome"
import { ImportIdentity } from "./components/ImportIdentity"
import { NewIdentity } from "./components/NewIdentity"
import { api } from "./api"
import { ChatApp } from "./components/ChatApp"

export function App() {
	return (
		<Router>
			{({ route, navigate }) => {
				if (route.type === "root") {
					return <Root navigate={navigate} />
				}

				if (route.type === "welcome") {
					return (
						<Welcome
							onNewIdentity={() => navigate({ type: "chat" })}
							onImportIdentity={() => navigate({ type: "import" })}
						/>
					)
				}
				if (route.type === "import") {
					return (
						<ImportIdentity
							onCancel={() => navigate({ type: "welcome" })}
							onSubmit={() => navigate({ type: "welcome" })}
						/>
					)
				}
				if (route.type === "new") {
					return (
						<NewIdentity
							onCancel={() => navigate({ type: "welcome" })}
							onSubmit={name => {
								const { id } = api.createFriend({ name })
								navigate({ type: "chat", friendId: id })
							}}
						/>
					)
				}
				if (route.type === "chat") {
					return (
						<ChatApp friendId={route.friendId} friends={api.getFriends()} />
					)
				}

				if (route.type === "unknown") {
					return <div>404</div>
				}
			}}
		</Router>
	)
}
