import * as path from "path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import { Configuration } from "webpack"

const config: Configuration = {
	target: "electron-renderer",
	mode: "development",
	entry: "./src/renderer/renderer.tsx",
	resolve: {
		extensions: [".js", ".ts", ".tsx"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [{ loader: "awesome-typescript-loader" }],
			},
		],
	},
	cache: true,
	devtool: "source-map",
	output: {
		path: path.join(__dirname, "build", "renderer"),
		filename: "renderer.js",
		chunkFilename: "[name].js",
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "src/renderer/index.html"),
		}),
	],
}

export default config
