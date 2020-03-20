// Four basic scenarios.

// a: hello, I am the source, I have 12
// b: welcome, I have 10
// a: I have 12, here are 2
// b: thanks

// a: hello, I am the source, I have 10
// b: welcome, I have 10, later

function sync(src, sink) {
	src.send("hello", { size: 12 })
	sink.on("hello", () => {
		sink.send("welcome", { size: 10 })
		// maybe done
	})
	src.on("welcome", ({ size }) => {
		src.send("batch", { size: 12, values: [1, 2] })
		// OR
		// done
	})

	sink.on("batch", ({ size, value }) => {
		sink.send("thanks")
		// done
	})
	src.on("thanks", () => {
		// done
	})
}

// b: hello, I am the sink, I have 10
// a: welcome, I have 12, here are 2
// b: thanks

// b: hello, I am the sink, I have 10
// a: welcome, I have 10, be patient

function sync2(sink, src) {
	sink.send("hello", { size: 10 })
	src.on("hello", () => {
		src.send("welcome", { size: 12, values: [1, 2] })
		// OR
		src.send("welcome", { size: 12 })
		// done
	})
	sink.on("welcome", ({ size }) => {
		sink.send("thanks")
		// OR
		// done
	})
}

function* src() {
	const response: { type: "welcome"; size: number } = yield { type: "hello" }
}

class Source {
	log: Array<any> = []
}

class Sink {
	log: Array<any> = []
}

// a: hello, I am the source, I have 12
// b: welcome, I have 10
// a: I here are 2
// b: thanks

// a: hello, I am the source, I have 10
// b: welcome, I have 10, later
const continuation = [
	(src: Source) => {
		return [
			{ size: src.log.length }, // hello
			(sink: Sink, arg: { size: number }) => {
				if (arg.size <= sink.log.length) {
					return [
						{ size: sink.log.length }, // welcome
					]
				} else {
					return [
						{ size: sink.log.length }, // welcome
						(src: Source, arg: { size: number }) => {
							return [
								{ index: arg.size, values: sink.log.slice(arg.size) },
								(sink: Sink, arg: { index: number; values: Array<any> }) => {
									sink.log.splice(arg.index, 99, ...arg.values)
								},
							]
						},
					]
				}
			},
		]
	},
]

export default {}
