let socket = null;
let timerDisplay = null;

document.addEventListener("DOMContentLoaded", () => {
	timerDisplay = document.getElementById("timer-display");
	socket = io();

	socket.on("race started", (race) => {
		updateDisplay(race.remaining || race.durationSeconds);
	});

	socket.on("race tick", (seconds) => {
		updateDisplay(seconds);
	});

	socket.on("race sessions", (sessions) => {
		const activeRace = sessions.find((s) => s.state === "started");
		if (activeRace && activeRace.remaining !== undefined) {
			updateDisplay(activeRace.remaining);
		}
	});

	socket.on("session ended", () => {
		updateDisplay(0);
	});

	socket.on("connect", () => {
		console.log("Connected to race countdown");
		socket.emit("request sessions");
	});
});

function updateDisplay(seconds) {
	if (!timerDisplay) return;
	const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
	const secs = String(seconds % 60).padStart(2, "0");
	timerDisplay.textContent = `${minutes}:${secs}`;
}
