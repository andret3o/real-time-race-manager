const accessKeys = {
	frontDesk: process.env.RECEPTIONIST_KEY,
	raceControl: process.env.SAFETY_KEY,
	lapTracker: process.env.OBSERVER_KEY,
};

function validateAccessKeys() {
	const missing = [];
	if (!accessKeys.frontDesk) missing.push("RECEPTIONIST_KEY");
	if (!accessKeys.raceControl) missing.push("SAFETY_KEY");
	if (!accessKeys.lapTracker) missing.push("OBSERVER_KEY");

	if (missing.length > 0) {
		console.error("ERROR: Missing required environment variables, run:");
		console.error("  export RECEPTIONIST_KEY=your_key_here");
		console.error("  export SAFETY_KEY=your_key_here");
		console.error("  export OBSERVER_KEY=your_key_here");
		console.error("  npm start");
		process.exit(1);
	}
}

async function verifyAccessKey(interfaceName, providedKey) {
	const isValid = accessKeys[interfaceName] === providedKey;

	if (!isValid) {
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	return isValid;
}

module.exports = { validateAccessKeys, verifyAccessKey };
