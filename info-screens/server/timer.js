const EventEmitter = require("events");

class RaceTimer extends EventEmitter {
	constructor() {
		super();
		this.remaining = 0;
		this.interval = null;
		this.running = false;
	}

	start(seconds) {
		if (this.running) return;

		this.remaining = seconds;
		this.running = true;

		this.emit("start", this.remaining);

		this.interval = setInterval(() => {
			this.remaining--;
			this.emit("tick", this.remaining);

			if (this.remaining <= 0) {
				this.stop();
				this.emit("finish");
			}
		}, 1000);
	}

	stop() {
		if (!this.running) return;
		clearInterval(this.interval);
		this.interval = null;
		this.running = false;
	}

	reset() {
		this.stop();
		this.remaining = 0;
		this.emit("reset");
	}

	getTime() {
		return this.remaining;
	}
}

module.exports = RaceTimer;
