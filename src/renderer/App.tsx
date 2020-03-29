import * as React from "react"
import { Router } from "./components/Router"
import { Root } from "./components/Root"
import { Welcome } from "./components/Welcome"
import { Playground } from "./components/Playground"

export function App() {
	return (
		<Router>
			{({ route, navigate }) => {
				if (route.type === "root") {
					return <Playground />
					// return <Root navigate={navigate} />
				}
				if (route.type === "welcome") {
					return <Welcome navigate={navigate} />
				}
				if (route.type === "chat") {
					return <div>TBD</div>
				}

				if (route.type === "unknown") {
					return <div>404</div>
				}
			}}
		</Router>
	)
}
