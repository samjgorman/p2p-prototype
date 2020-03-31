import * as path from "path"
import { Configuration } from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

const config: Configuration = {
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
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
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
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "src/renderer/index.html"),
		}),
	],
}

export default config
