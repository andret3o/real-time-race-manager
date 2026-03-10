let socket = null;
let sessions = [];

function initializeRaceControl(authenticatedSocket) {
	socket = authenticatedSocket;

	const btnSafe = document.getElementById("btn-safe");
	const btnHazard = document.getElementById("btn-hazard");
	const btnDanger = document.getElementById("btn-danger");
	const btnEndSession = document.getElementById("btn-end-session");

	if (btnSafe) btnSafe.onclick = () => setMode("SAFE");
	if (btnHazard) btnHazard.onclick = () => setMode("HAZARD");
	if (btnDanger) btnDanger.onclick = () => setMode("DANGER");
	if (btnEndSession) btnEndSession.onclick = () => socket.emit("end session");

	socket.on("race sessions", (data) => {
		sessions = data;
		renderNextRace();
	});

	socket.on("current race state", (state) => {
		const main = document.getElementById("main-content");
		const post = document.getElementById("post-race");
		const active = document.getElementById("active-race");

		if (state.status === "active") {
			main.classList.add("hidden");
			post.classList.add("hidden");
			active.classList.remove("hidden");
			updateTimer(state.durationSeconds);
			updateMode(state.mode);
		} else if (state.status === "finished") {
			main.classList.add("hidden");
			active.classList.add("hidden");
			post.classList.remove("hidden");
		} else {
			active.classList.add("hidden");
			post.classList.add("hidden");
			main.classList.remove("hidden");
		}
	});

	socket.on("race started", (race) => {
		const main = document.getElementById("main-content");
		const post = document.getElementById("post-race");
		const active = document.getElementById("active-race");

		main.classList.add("hidden");
		post.classList.add("hidden");
		active.classList.remove("hidden");

		updateTimer(race.durationSeconds);
		updateMode(race.mode);
	});

	socket.on("race tick", updateTimer);
	socket.on("race mode", updateMode);

	socket.on("race finished", () => {
		const active = document.getElementById("active-race");
		const post = document.getElementById("post-race");

		active.classList.add("hidden");
		post.classList.remove("hidden");
	});

	socket.on("session ended", () => {
		const post = document.getElementById("post-race");
		const main = document.getElementById("main-content");

		post.classList.add("hidden");
		main.classList.remove("hidden");
	});

	socket.emit("request sessions");
	socket.emit("request race state");
}

function renderNextRace() {
	const nextRaceContainer = document.getElementById("next-race-drivers");

	if (!sessions.length) {
		nextRaceContainer.innerHTML =
			'<p class="text-gray-500 text-center">No upcoming race</p>';
		return;
	}

	const next = sessions.find((s) => s.state === "next-race");

	if (!next) {
		nextRaceContainer.innerHTML =
			'<p class="text-gray-500 text-center">No upcoming race</p>';
		return;
	}

	nextRaceContainer.innerHTML = `
    <div class="border rounded-lg p-4 w-full">
      <p class="border-b pb-2 mb-2">Next Race Session</p>
      <div class="flex flex-col gap-1 text-sm">
        ${next.drivers
					.map(
						(driver) => `
              <div class="flex justify-between pt-1 pb-1">
                <p>${driver.name}</p>
                <p class="text-gray-500">Car ${driver.car}</p>
              </div>
            `,
					)
					.join("")}
      </div>
    </div>
  `;
}

function updateTimer(seconds) {
	const timerEl = document.getElementById("race-timer");
	const m = String(Math.floor(seconds / 60)).padStart(2, "0");
	const s = String(seconds % 60).padStart(2, "0");
	timerEl.textContent = `${m}:${s}`;
}

function updateMode(mode) {
	const styles = {
		SAFE: "bg-green-500 text-white",
		HAZARD: "bg-yellow-400 text-black",
		DANGER: "bg-red-500 text-white",
		FINISH: "bg-black text-white",
	};

	const modeBadge = document.getElementById("race-mode");
	modeBadge.textContent = mode;
	modeBadge.className = `px-6 py-3 rounded-lg text-sm font-medium ${styles[mode]}`;
}

function setMode(mode) {
	if (!socket) return;
	socket.emit("set mode", mode);
	updateMode(mode);
}

function startRace() {
	if (!socket) return;
	socket.emit("start race");
}

function finishRace() {
	if (!socket) return;
	socket.emit("finish race");
}

document.addEventListener("DOMContentLoaded", () => {
	const auth = new Auth("raceControl", initializeRaceControl);
	auth.initialize("auth-form", "p", "main-content");
});
