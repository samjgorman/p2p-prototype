import electron from "electron"

const preloadApi = {
	openExternalUrl(url: string) {
		electron.shell.openExternal(url)
	},
	listIdentities(): Array<string> {
		return []
	},
	createIdentity(name: string) {
		return
	},
}

export type PreloadApi = typeof preloadApi

window["preloadApi"] = preloadApi
