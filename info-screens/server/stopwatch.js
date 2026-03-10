class Stopwatch {
	constructor() {
		this.fastestLap = null;
		this.laps = 0;
		this.startTime = 0;
		this.elapsedTime = 0;
		this.isRunning = false;
	}

	lap() {
		if (!this.isRunning) {
			this.startTime = Date.now() - this.elapsedTime;
			this.isRunning = true;
		} else {
			this.elapsedTime = Date.now() - this.startTime;

			if (!this.fastestLap || this.elapsedTime < this.fastestLap) {
				this.fastestLap = this.elapsedTime;
			}
			this.laps++;
			this.startTime = Date.now();
		}
	}

	stop() {
		this.startTime = 0;
		this.elapsedTime = 0;
		this.isRunning = false;
	}
}

module.exports = {
	Stopwatch,
};
