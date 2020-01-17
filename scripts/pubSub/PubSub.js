export class PubSub {
	constructor() {
		this.events = {};
	}

	subscribe(ev, listener) {
		if (!this.events[ev]) {
			this.events[ev] = [];
		}
		this.events[ev].push(listener);
	}

	unsubscribe(ev, listener) {
		if (this.events[ev] || this.events[ev].find(listener)) {
			this.events[ev] = this.events[ev].filter((func) => func != listener);
		}
	}

	publish(ev, data = {}) {
		if (this.events[ev]) {
			this.events[ev].forEach((listener) => listener(data));
		}
	}
}
