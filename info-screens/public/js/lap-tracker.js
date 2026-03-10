let socket = null;
let auth = null;
let sessions = [];
let currentRace = null;

function initializeLapTracker(authenticatedSocket) {
	socket = authenticatedSocket;

	socket.on("race sessions", (data) => {
		sessions = data;
		currentRace = sessions.find((s) => s.state === "started");

		if (!currentRace) {
			currentRace = sessions.find((s) => s.state === "finished");
		}
		renderButtons();
	});

	socket.emit("request sessions");
}

document.addEventListener("DOMContentLoaded", () => {
	auth = new Auth("lapTracker", initializeLapTracker);
	auth.initialize("auth-form", "p", "main-content");
});

function renderButtons() {
	const container = document.getElementById("main-content");

	if (!container) return;

	container.innerHTML = "";

	if (!currentRace) {
		container.className = "flex items-center justify-center p-8";
		container.innerHTML =
			'<p class="text-lg font-medium text-center text-gray-500">No race in progress</p>';
		return;
	}

	container.className =
		"grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl";

	if (currentRace.finished === true) {
		const message = document.createElement("div");
		message.className =
			"col-span-full text-center bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-lg font-semibold";
		message.textContent = "⚠️ RACE SESSION HAS ENDED - BUTTONS DISABLED ⚠️";
		container.appendChild(message);
	}

	currentRace.drivers.forEach((driver) => {
		const button = document.createElement("button");
		button.textContent = driver.car;
		button.setAttribute("aria-label", `Car ${driver.car} crossed lap line`);

		if (currentRace.finished === true) {
			button.disabled = true;
			button.className =
				"bg-gray-400 text-gray-700 p-4 sm:p-8 md:p-16 lg:p-24 text-4xl sm:text-6xl md:text-8xl lg:text-9xl cursor-not-allowed opacity-50 flex items-center justify-center";
		} else {
			button.className =
				"bg-black text-white p-4 sm:p-8 md:p-16 lg:p-24 text-4xl sm:text-6xl md:text-8xl lg:text-9xl hover:bg-gray-800 active:bg-gray-700 transition-colors flex items-center justify-center";
			button.onclick = () => {
				if (socket) {
					socket.emit("car crossed", driver.car);
					button.classList.add("bg-green-600");
					setTimeout(() => {
						button.classList.remove("bg-green-600");
					}, 200);
				}
			};
		}

		container.appendChild(button);
	});
}

function carCrossed(carNumber) {
	if (!socket) return;
	socket.emit("car crossed", carNumber);
}
