let socket = null;
let currentRace = null;
let drivers = [];

document.addEventListener("DOMContentLoaded", () => {
	socket = io();

	socket.on("race sessions", (sessions) => {
		currentRace = sessions.find((s) => s.state === "started");

		if (!currentRace) {
			currentRace = sessions.find((s) => s.state === "finished");
		}

		if (currentRace) {
			drivers = currentRace.drivers.sort(compareFastestLaps);
			if (currentRace.remaining !== undefined) {
				updateTimer(currentRace.remaining);
			}
		} else {
			drivers = [];
		}

		renderLeaderboard();
        updateFlag();
	});

	socket.on("race started", (race) => {
		updateTimer(race.remaining || race.durationSeconds);
	});

	socket.on("race tick", (seconds) => {
		updateTimer(seconds);
	});

	socket.emit("request sessions");
});

function renderLeaderboard() {
	updateFlag();

	const container = document.getElementById("container");
	container.innerHTML = "";

	if (!currentRace || !drivers.length) {
		container.innerHTML = `
			<div class="text-center text-gray-500 p-8">
				<p class="text-xl font-medium">No active race</p>
				<p class="text-sm mt-2">Waiting for next session to start...</p>
			</div>
		`;
		return;
	}

	const HEADERS = ["POS", "CAR", "DRIVER", "FASTEST LAP", "LAPS"];

	const header = document.createElement("div");
	header.className = "flex items-center justify-between border rounded-lg p-2";

	HEADERS.forEach((h) => {
		const column = document.createElement("p");
		column.className = "text-sm font-medium";
		column.textContent = h;
		header.appendChild(column);
	});

	container.appendChild(header);

	drivers.forEach((driver, index) => {
		const driverRow = document.createElement("div");
		driverRow.className =
			"flex items-center justify-between border rounded-lg p-2";

		const position = document.createElement("p");
		position.className = "text-lg font-medium";
		position.textContent = index + 1;

		const car = document.createElement("p");
		car.className = "text-lg font-medium";
		car.textContent = `Car ${driver.car}`;

		const name = document.createElement("p");
		name.className = "text-lg font-medium";
		name.textContent = driver.name;

		const fastestLap = document.createElement("p");
		fastestLap.className = "text-lg font-medium";
		fastestLap.textContent = formatLapTime(driver.fastestLap);

		const laps = document.createElement("p");
		laps.className = "text-lg font-medium";
		laps.textContent = driver.laps;

		driverRow.appendChild(position);
		driverRow.appendChild(car);
		driverRow.appendChild(name);
		driverRow.appendChild(fastestLap);
		driverRow.appendChild(laps);
		container.appendChild(driverRow);
	});
}

function updateTimer(seconds) {
	const timerEl = document.getElementById("timer-display");
	if (!timerEl) return;

	const m = String(Math.floor(seconds / 60)).padStart(2, "0");
	const s = String(seconds % 60).padStart(2, "0");
	timerEl.textContent = `${m}:${s}`;
}

function updateFlag() {
	const styles = {
		SAFE: "bg-green-500",
		HAZARD: "bg-yellow-400",
		DANGER: "bg-red-500",
		FINISH: "bg-black",
	};
	const flagEl = document.getElementById("flag-display");
	if (!flagEl) return;

	if (currentRace && currentRace.mode) {
		flagEl.className = `w-14 h-10 ${styles[currentRace.mode]}`;
	} else {
		flagEl.className = `w-14 h-10 bg-red-500`;
	}
}

function compareFastestLaps(a, b) {
	if (!a.fastestLap || a.fastestLap === 0) return 1;
	if (!b.fastestLap || b.fastestLap === 0) return -1;
	return a.fastestLap - b.fastestLap;
}

function formatLapTime(timeMs) {
	if (!timeMs || timeMs === 0) {
		return "--:--.---";
	}

	const minutes = Math.floor(timeMs / 60000);
	const seconds = Math.floor((timeMs % 60000) / 1000);
	const milliseconds = Math.floor(timeMs % 1000);

	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}
