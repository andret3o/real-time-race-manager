const state = require("./state");
const { verifyAccessKey } = require("./auth");

function setUpSocketEvents(io) {
	state.initializeTimerEvents(io);

	io.on("connection", (socket) => {
		console.log("user connected");

		socket.authenticated = false;
		socket.role = null;

		// Auth
		socket.on(
			"authenticate",
			async ({ interface: interfaceName, accessKey }) => {
				const isValid = await verifyAccessKey(interfaceName, accessKey);

				if (!isValid) {
					socket.emit("auth-failure", {
						message: "Invalid access key. Please try again",
					});
					return;
				}

				socket.authenticated = true;
				socket.role = interfaceName;
				socket.emit("auth-success");
				socket.emit("race sessions", state.getSessions());
			},
		);

		// Sessions
		socket.on("request sessions", () => {
			socket.emit("race sessions", state.getSessions());
		});

		socket.on("add session", (drivers) => {
			if (socket.role !== "frontDesk") return;

			state.addSession(drivers);
			io.emit("race sessions", state.getSessions());
		});

		socket.on("delete session", (sessionId) => {
			if (socket.role !== "frontDesk") return;

			state.deleteSession(sessionId);
			io.emit("race sessions", state.getSessions());
		});

		socket.on("edit drivers", (sessionId, drivers) => {
			if (socket.role !== "frontDesk") return;

			state.updateDrivers(sessionId, drivers);
			io.emit("race sessions", state.getSessions());
		});

		socket.on("remove driver", (sessionId, index) => {
			if (socket.role !== "frontDesk") return;

			state.removeDriver(sessionId, index);
			io.emit("race sessions", state.getSessions());
		});

		// Stopwatch
		socket.on("car crossed", (car) => {
			if (socket.role !== "lapTracker") return;

			state.handleLaps(car);
			io.emit("race sessions", state.getSessions());
		});

		// race control
		socket.on("request race state", () => {
			if (socket.role !== "raceControl") return;

			const activeRace = state.getActiveRace();

			if (
				activeRace &&
				activeRace.state === "started" &&
				!activeRace.finished
			) {
				socket.emit("current race state", {
					status: "active",
					durationSeconds: activeRace.remaining || activeRace.durationSeconds,
					mode: activeRace.mode,
				});
			} else if (activeRace && activeRace.finished) {
				socket.emit("current race state", {
					status: "finished",
				});
			} else {
				socket.emit("current race state", {
					status: "idle",
				});
			}
		});

		socket.on("start race", () => {
			if (socket.role !== "raceControl") return;

			const sessions = state.getSessions();
			const next = sessions.find((s) => s.state === "next-race");

			if (!next || !next.drivers.length) return;

			const duration = Number(process.env.TIMER_DURATION) || 600;
			state.startRace(next, duration, io);
		});

		socket.on("set mode", (mode) => {
			if (socket.role !== "raceControl") return;
			state.setRaceMode(mode, io);
		});

		socket.on("finish race", () => {
			if (socket.role !== "raceControl") return;
			state.finishRace(io);
		});

		socket.on("end session", () => {
			if (socket.role !== "raceControl") return;
			state.endSession(io);
		});
	});
}

module.exports = { setUpSocketEvents };
