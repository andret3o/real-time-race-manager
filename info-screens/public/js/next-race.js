let socket = null;
let sessions = [];

function initialize() {
	socket = io();

	socket.on("connect_error", () => {
		console.error("Failed to connect to server");
	});

	socket.on("race sessions", (data) => {
		sessions = data;
		renderNextRace();
	});

	socket.emit("request sessions");
}

function renderNextRace() {
	const container = document.getElementById("drivers-container");
	const title = document.querySelector("h1");

	if (!container || !title) {
		console.error("Required elements not found");
		return;
	}

	const nextRaceSession = sessions.find((s) => s.state === "next-race");

	if (!nextRaceSession) {
		container.innerHTML =
			'<p class="text-lg font-medium text-center">No upcoming race scheduled</p>';
		const messageDiv = document.getElementById("paddock-message");
		if (messageDiv) {
			messageDiv.remove();
		}
		return;
	}

	if (nextRaceSession.proceedToPaddock === true) {
		let messageDiv = document.getElementById("paddock-message");
		if (!messageDiv) {
			messageDiv = document.createElement("div");
			messageDiv.id = "paddock-message";
			messageDiv.className =
				"bg-green-500 text-white text-lg font-medium p-2 rounded-lg text-center mb-4";
			messageDiv.textContent = "⚠️ PROCEED TO PADDOCK NOW ⚠️";
			title.after(messageDiv);
		}
	} else {
		const messageDiv = document.getElementById("paddock-message");
		if (messageDiv) {
			messageDiv.remove();
		}
	}

	container.innerHTML = nextRaceSession.drivers
		.map(
			(driver) => `
		<div class="flex items-center justify-between border rounded-lg p-2">
			<p class="text-lg font-medium">${driver.name}</p>
			<p class="text-lg font-medium">Car ${driver.car}</p>
		</div>
	`,
		)
		.join("");
}

document.addEventListener("DOMContentLoaded", () => {
	initialize();
});
