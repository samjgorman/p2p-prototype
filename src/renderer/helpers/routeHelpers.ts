import { parse } from "url"

type RootRoute = { type: "root" }
type WelcomeRoute = { type: "welcome" }
type ChatRoute = { type: "chat"; chatId: string }
type UnknownRoute = { type: "unknown"; url: string }

export type Route = RootRoute | WelcomeRoute | ChatRoute | UnknownRoute

export function parseRoute(url: string): Route {
	const parsed = parse(url, true)
	if (!parsed.hash || parsed.hash === "#") {
		return { type: "root" }
	}

	if (parsed.hash === "#welcome") {
		return { type: "welcome" }
	}

	if (parsed.hash === "#chat") {
		const chatId = parsed.query.charId as string
		return { type: "chat", chatId }
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
	if (route.type === "chat") {
		return "#chat?chatId=" + route.chatId
	}
	return route.url
}
