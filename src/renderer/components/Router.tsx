import * as React from "react"
import { parseRoute, Route, formatRoute } from "../helpers/routeHelpers"

type HistoryState = {
	scrollTop: number
}

type RouterState<R extends Route = Route> = {
	historyState: HistoryState | undefined
	route: R
}

export interface RouterFunctions {
	route: Route
	historyState: HistoryState | undefined
	navigate(route: Route): void
}

interface RouterProps {
	children: (props: RouterFunctions) => React.ReactNode
}

export class Router extends React.PureComponent<RouterProps> {
	state: RouterState

	constructor(props) {
		super(props)
		const historyState: HistoryState | undefined = window.history.state
		const route = parseRoute(window.location.href)
		this.state = { historyState, route }
		window.onpopstate = event => {
			const url = window.location.href
			const route = parseRoute(url)
			const historyState: HistoryState | undefined = event.state
			this.setState({ historyState, route })
		}
	}

	render() {
		return this.props.children({ ...this.state, navigate: this.navigate })
	}

	navigate = (route: Route) => {
		const historyState: HistoryState | undefined = undefined
		window.history.pushState(historyState, "", formatRoute(route))
		this.setState({ historyState, route })
	}
}
