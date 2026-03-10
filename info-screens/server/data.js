const Database = require("better-sqlite3");
const { unlinkSync, existsSync } = require("fs");

let db = null;

function handleDB() {
	if (existsSync("sessions.db")) {
		db = new Database("sessions.db");
		return recoverData();
	} else {
		createDB();
		return [];
	}
}

function createDB() {
	db = new Database("sessions.db");

	db.pragma("journal_mode = WAL");

	db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mode TEXT,
            state TEXT,
            durationSeconds INTEGER NOT NULL DEFAULT 600,
            finished BOOLEAN
        );
        CREATE TABLE IF NOT EXISTS drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            car INTEGER NOT NULL,
            fastestLap INTEGER DEFAULT 0,
            laps INTEGER DEFAULT 0,

            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        );
    `);
}

function recoverData() {
	if (!db) return [];

	const sessions = [];

	const sessionRows = db
		.prepare(
			`
        SELECT id, mode, state, durationSeconds, finished
        FROM sessions
        ORDER BY id ASC
    `,
		)
		.all();

	sessionRows.forEach((row) => {
		const driverRows = db
			.prepare(
				`
            SELECT name, car, fastestLap, laps
            FROM drivers
            WHERE session_id = ?
            ORDER BY id ASC
        `,
			)
			.all(row.id);

		const drivers = driverRows.map((d) => ({
			name: d.name,
			car: d.car,
			fastestLap: d.fastestLap,
			laps: d.laps,
		}));

		sessions.push({
			id: row.id,
			drivers: drivers,
			mode: row.mode,
			state: row.state,
			durationSeconds: row.durationSeconds,
			finished: !!row.finished,
		});
	});
	return sessions;
}

function updateDB(sessions) {
	clearDB();
	createDB();

	sessions.forEach((s) => {
		if (s.state !== "pending" && s.state !== "next-race") {
			return;
		}

		db.prepare(
			`
            INSERT INTO sessions (id, mode, state, durationSeconds, finished)
            VALUES (?, ?, ?, ?, ?)`,
		).run(s.id, s.mode, s.state, s.durationSeconds, s.finished ? 1 : 0);

		s.drivers.forEach((d) => {
			db.prepare(
				`
                INSERT INTO drivers (session_id, name, car, fastestLap, laps)
                VALUES (?, ?, ?, ?, ?)`,
			).run(s.id, d.name, d.car, d.fastestLap, d.laps);
		});
	});
}

function clearDB() {
	if (existsSync("sessions.db")) {
		unlinkSync("sessions.db");
		unlinkSync("sessions.db-shm");
		unlinkSync("sessions.db-wal");
	}
}

module.exports = {
	handleDB,
	updateDB,
};
