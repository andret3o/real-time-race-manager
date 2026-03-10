let socket = null;
let mode = null;
const body = document.body;
const styles = {
	SAFE: "bg-green-500",
	HAZARD: "bg-yellow-400",
	DANGER: "bg-red-500",
	FINISH: "checkered",
};

socket = io();

socket.on("race sessions", (data) => {
	let currentRace = data.find((s) => s.state === "started");

	if (!currentRace) {
		currentRace = data.find((s) => s.state === "finished");
	}

	socket.on("race sessions", (data) => {
		let currentRace =
			data.find((s) => s.state === "started") ??
			data.find((s) => s.state === "finished");

		if (currentRace && currentRace.mode && mode === null) {
			mode = currentRace.mode;
			renderFlags();
		}
	});

	renderFlags();
});

socket.emit("request sessions");

socket.on("race mode", (newMode) => {
	mode = newMode;
	renderFlags();
});

socket.on("race started", (race) => {
	mode = race.mode;
	renderFlags();
});

socket.on("race finished", (race) => {
	mode = race.mode;
	renderFlags();
});

socket.on("session ended", () => {
	mode = "DANGER";
	renderFlags();
});

function renderFlags() {
	const className = mode ? styles[mode] : styles["DANGER"];
	body.className = className;
}
