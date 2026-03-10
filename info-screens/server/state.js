const { Stopwatch } = require("./stopwatch");
const RaceTimer = require("./timer");
const { updateDB } = require("./data");

let activeRace = null;
const raceTimer = new RaceTimer();
const sessions = [];
let ioInstance = null;

function getSessions() {
	return sessions;
}

function addSession(driverNames) {
	const uniqueNames = new Set(driverNames.map((d) => d.trim()));
	if (uniqueNames.size !== driverNames.length) {
		throw new Error("Driver names must be unique within a session");
	}

	if (!Array.isArray(driverNames) || driverNames.length === 0) return;

	const maxId = sessions.reduce((m, s) => Math.max(m, s.id), 0);
	const drivers = driverNames.map((d, index) => {
		return {
			name: d.trim(),
			stopwatch: new Stopwatch(),
			car: index + 1,
			fastestLap: 0,
			laps: 0,
		};
	});

	const session = {
		id: maxId + 1,
		drivers: drivers,
		mode: null,
		state:
			sessions.length == 0 ||
			sessions[sessions.length - 1].state === "started" ||
			sessions[sessions.length - 1].state === "finished"
				? "next-race"
				: "pending",
		durationSeconds: Number(process.env.TIMER_DURATION) || 600,
		finished: false,
	};

	sessions.push(session);
	updateDB(sessions);
}

function deleteSession(sessionId) {
	const sessionToDel = sessions.find((session) => session.id === sessionId);
	if (sessionToDel && sessionToDel.state === "next-race") {
		const nextRace = sessions[sessions.indexOf(sessionToDel) + 1];
		if (nextRace) {
			nextRace.state = "next-race";
		}
	}

	if (sessionToDel) {
		sessions.splice(sessions.indexOf(sessionToDel), 1);
		updateDB(sessions);
	}
}

function removeDriver(sessionId, index) {
	const session = sessions.find((s) => s.id === sessionId);
	if (!session || index < 0 || index >= session.drivers.length) return;

	session.drivers.splice(index, 1);
	updateDB(sessions);
}

function updateDrivers(sessionId, driverNames) {
	const session = sessions.find((session) => session.id === sessionId);
	if (!session) return;

	const drivers = driverNames.map((d, index) => {
		return {
			name: d.trim(),
			stopwatch: new Stopwatch(),
			car: index + 1,
			fastestLap: 0,
			laps: 0,
		};
	});

	session.drivers = drivers;
	updateDB(sessions);
}

function updateSessionsFromDB(data) {
	data.forEach((s) => {
		s.drivers.forEach((d) => {
			d.stopwatch = new Stopwatch();
		});
		sessions.push(s);
	});
}

function handleLaps(car) {
	const session = sessions.find((s) => s.state === "started");
	if (!session) return;

	const driver = session.drivers.find((d) => d.car === car);
	if (!driver) return;

	driver.stopwatch.lap();
	const fastestLap = driver.stopwatch.fastestLap;
	if (fastestLap) driver.fastestLap = fastestLap;
	driver.laps = driver.stopwatch.laps;

	updateDB(sessions);
}

function initializeTimerEvents(io) {
	ioInstance = io;

	raceTimer.on("tick", (remaining) => {
		if (activeRace) {
			activeRace.remaining = remaining;
			io.emit("race tick", remaining);
		}
	});

	raceTimer.on("finish", () => {
		if (activeRace && !activeRace.finished) {
			activeRace.mode = "FINISH";
			activeRace.finished = true;
			io.emit("race finished", activeRace);
			updateDB(sessions);
		}
	});
}

function startRace(session, durationSeconds, io) {
	activeRace = session;
	activeRace.mode = "SAFE";
	activeRace.durationSeconds = durationSeconds;
	activeRace.finished = false;
	activeRace.state = "started";
	activeRace.remaining = durationSeconds;

	const nextSession = sessions[sessions.indexOf(session) + 1];
	if (nextSession) {
		nextSession.state = "next-race";
	}

	raceTimer.start(durationSeconds);
	io.emit("race started", activeRace);
	io.emit("race sessions", getSessions());
	updateDB(sessions);
}

function setRaceMode(mode, io) {
	if (!activeRace || activeRace.finished) return;
	activeRace.mode = mode;
	io.emit("race mode", mode);
	io.emit("race sessions", getSessions());
	updateDB(sessions);
}

function finishRace(io) {
	if (!activeRace || activeRace.finished) return;

	activeRace.mode = "FINISH";
	activeRace.finished = true;
	activeRace.state = "finished";
	raceTimer.stop();

	io.emit("race finished", activeRace);
	io.emit("race sessions", getSessions());
	updateDB(sessions);
}

function endSession(io) {
	if (!activeRace) return;

	raceTimer.stop();

	activeRace.state = "session-ended";
	activeRace.mode = "DANGER";

	const currentIndex = sessions.indexOf(activeRace);
	const nextSession = sessions[currentIndex + 1];
	sessions.splice(currentIndex, 1);

	if (nextSession) {
		nextSession.state = "next-race";
		nextSession.proceedToPaddock = true;
	}

	activeRace = null;

	io.emit("session ended");
	io.emit("race sessions", getSessions());
	updateDB(sessions);
}

function getActiveRace() {
	return activeRace;
}

module.exports = {
	updateSessionsFromDB,
	addSession,
	getSessions,
	deleteSession,
	removeDriver,
	startRace,
	setRaceMode,
	finishRace,
	endSession,
	getActiveRace,
	handleLaps,
	updateDrivers,
	initializeTimerEvents,
};
