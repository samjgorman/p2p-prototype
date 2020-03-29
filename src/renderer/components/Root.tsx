import * as React from "react"
import { Route } from "../helpers/routeHelpers"

interface RootProps {
	navigate(route: Route): void
}

export class Root extends React.PureComponent<RootProps> {
	componentDidMount() {
		this.props.navigate({ type: "welcome" })
	}

	render() {
		return null
	}
}
