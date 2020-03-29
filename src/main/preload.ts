import electron from "electron"

const preloadApi = {
	openExternalUrl(url: string) {
		electron.shell.openExternal(url)
	},
}

export type PreloadApi = typeof preloadApi

window["preloadApi"] = preloadApi
