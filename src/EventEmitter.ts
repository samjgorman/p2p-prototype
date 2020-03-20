export class EventEmitter<Events extends { [event: string]: [] | [any] } = {}> {
	protected listeners: {
		[event in keyof Events]?: Set<(...args: Events[event]) => void>
	} = {}

	public addListener<Event extends keyof Events>(
		event: Event,
		callback: (...args: Events[Event]) => void
	) {
		let set = this.listeners[event]
		if (!set) {
			set = new Set<(...args: Events[Event]) => void>()
			this.listeners[event] = set
		}
		set.add(callback)
	}

	public removeListener<Event extends keyof Events>(
		event: Event,
		callback: (...args: Events[Event]) => void
	) {
		const set = this.listeners[event]
		if (set) {
			set.delete(callback)
			if (set.size === 0) {
				delete this.listeners[event]
			}
		}
	}

	public emit<Event extends keyof Events>(
		event: Event,
		...args: Events[Event]
	) {
		const set = this.listeners[event]
		if (set) {
			set.forEach(callback => callback(...args))
		}
	}
}
