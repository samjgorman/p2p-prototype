import { parse } from "url"
import { pathToRegexp } from "path-to-regexp"

type RootRoute = { type: "root" }
type WelcomeRoute = { type: "welcome" }
type ChatRoute = { type: "chat"; chatId: string }
type UnknownRoute = { type: "unknown"; url: string }

export type Route = RootRoute | WelcomeRoute | ChatRoute | UnknownRoute

export function parseRoute(url: string): Route {
	const parsed = parse(url)
	if (!parsed.pathname || parsed.pathname.endsWith("/index.html")) {
		return { type: "root" }
	}

	if (parsed.pathname === "/welcome") {
		return { type: "welcome" }
	}

	const chatResult = match(parsed.pathname, "/chat/:chatId")
	if (chatResult) {
		return { type: "chat", chatId: chatResult.chatId }
	}

	return { type: "unknown", url }
}

// TODO: we can test all these functions have proper inverses.
export function formatRoute(route: Route) {
	if (route.type === "root") {
		return "/"
	}
	if (route.type === "welcome") {
		return "/welcome"
	}
	if (route.type === "chat") {
		return "/chat/" + route.chatId
	}
	return route.url
}

function match(
	pathname: string,
	pattern: string
): { [key: string]: string } | undefined {
	const keys: any = []
	const regex = pathToRegexp(pattern, keys)
	const result = regex.exec(pathname)
	if (!result) {
		return
	}
	return keys.reduce((obj, key, index) => {
		obj[key.name] = result[index + 1]
		return obj
	}, {})
}
