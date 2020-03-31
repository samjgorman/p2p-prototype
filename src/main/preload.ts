import electron from "electron"
import { Api } from "./api"

export type PreloadApi = Api

window["electron"] = electron
window["preloadApi"] = new Proxy(
	{},
	{ get: (obj, prop) => electron.remote.app["api"][prop] }
)
