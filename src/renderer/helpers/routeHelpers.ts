import { parse } from "url"

type RootRoute = { type: "root" }
type WelcomeRoute = { type: "welcome" }
type ImportIdentityRoute = { type: "import" }
type NewIdentityRoute = { type: "new" }
type ChatRoute = { type: "chat"; friendId?: string }
type UnknownRoute = { type: "unknown"; url: string }

export type Route =
	| RootRoute
	| WelcomeRoute
	| ChatRoute
	| UnknownRoute
	| ImportIdentityRoute
	| NewIdentityRoute

export function parseRoute(url: string): Route {
	const parsed = parse(url, true)
	if (!parsed.hash || parsed.hash === "#") {
		return { type: "root" }
	}

	if (parsed.hash === "#welcome") {
		return { type: "welcome" }
	}

	if (parsed.hash === "#import") {
		return { type: "import" }
	}

	if (parsed.hash === "#new") {
		return { type: "new" }
	}

	console.log(parsed.hash)
	if (parsed.hash.startsWith("#chat?")) {
		const friendId = parsed.query.friendId as string
		return { type: "chat", friendId: friendId }
	}

	return { type: "unknown", url }
}

// TODO: we can test all these functions have proper inverses.
export function formatRoute(route: Route) {
	if (route.type === "root") {
		return "#"
	}
	if (route.type === "welcome") {
		return "#welcome"
	}
	if (route.type === "import") {
		return "#import"
	}
	if (route.type === "new") {
		return "#new"
	}
	if (route.type === "chat") {
		return "#chat?friendId=" + route.friendId
	}
	return route.url
}
