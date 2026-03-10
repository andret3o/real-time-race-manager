let socket = null;
let auth = null;
let sessions = [];
let editingSessionId = null;

function initializeFrontDesk(authenticatedSocket) {
	socket = authenticatedSocket;

	socket.on("race sessions", (data) => {
		sessions = data;
		renderSessions();
	});

	socket.emit("request sessions");
}

document.addEventListener("DOMContentLoaded", () => {
	auth = new Auth("frontDesk", initializeFrontDesk);
	auth.initialize("auth-form", "p", "main-content");

	const addForm = document.getElementById("add-form");
	const input = document.getElementById("drivers-input");
	const editForm = document.getElementById("edit-form");
	const editInput = document.getElementById("edit-input");

	addForm.addEventListener("submit", (e) => {
		e.preventDefault();

		if (!input.value.trim()) {
			alert("Please enter at least one driver name");
			return;
		}

		const drivers = input.value
			.split(",")
			.map((d) => d.trim())
			.filter((d) => d);

		if (drivers.length === 0) {
			alert("Please enter at least one driver name");
			return;
		}

		if (drivers.length > 8) {
			alert("A maximum of 8 drivers per session are allowed");
			return;
		}

		if (new Set(drivers).size !== drivers.length) {
			alert("Driver names must be unique");
			return;
		}

		socket.emit("add session", drivers);
		hideAddForm();
	});

	editForm.addEventListener("submit", (e) => {
		e.preventDefault();

		if (!editInput.value.trim()) {
			alert("Please enter at least one driver name");
			return;
		}

		const drivers = editInput.value
			.split(",")
			.map((d) => d.trim())
			.filter((d) => d);

		if (drivers.length === 0) {
			alert("Please enter at least one driver name");
			return;
		}

		if (drivers.length > 8) {
			alert("A maximum of 8 drivers per session are allowed");
			return;
		}

		if (new Set(drivers).size !== drivers.length) {
			alert("Driver names must be unique");
			return;
		}

		if (!editingSessionId) {
			alert("Error: couldn't find the selected session, try again.");
			return;
		}

		socket.emit("edit drivers", editingSessionId, drivers);
		hideEditForm();
	});
});

function showAddForm() {
	const addForm = document.getElementById("add-form");
	const editForm = document.getElementById("edit-form");

	editForm.classList.add("hidden");
	addForm.classList.remove("hidden");
	document.getElementById("drivers-input").focus();
}

function hideAddForm() {
	const addForm = document.getElementById("add-form");
	const input = document.getElementById("drivers-input");

	addForm.classList.add("hidden");
	input.value = "";
}

function hideEditForm() {
	const editForm = document.getElementById("edit-form");
	const editInput = document.getElementById("edit-input");

	editForm.classList.add("hidden");
	editInput.value = "";
	editingSessionId = null;
}

function renderSessions() {
	const container = document.getElementById("sessions-container");
	container.innerHTML = "";

	if (!sessions || sessions.length === 0) {
		container.innerHTML = `
			<div class="text-center p-8 border rounded-lg">
				<p class="text-lg font-medium">No race sessions scheduled</p>
				<p class="text-sm mt-2">Click "New session" above to create one</p>
			</div>
		`;
		return;
	}

	sessions.forEach((session) => {
		const sessionDiv = document.createElement("div");
		sessionDiv.className = "border rounded-lg p-4 bg-white shadow-sm";

		const header = document.createElement("div");
		header.className = "flex justify-between items-center border-b pb-3 mb-3";

		const titleSection = document.createElement("div");
		titleSection.className = "flex flex-col gap-1";

		const title = document.createElement("p");
		title.className = "font-semibold text-lg";
		title.textContent = `Race #${session.id}`;

		const state = document.createElement("p");
		state.className = "text-sm text-gray-600";
		state.textContent = `Status: ${session.state}`;

		titleSection.appendChild(title);
		titleSection.appendChild(state);

		const btnContainer = document.createElement("div");
		btnContainer.className = "flex gap-2";

		const editBtn = document.createElement("button");
		editBtn.textContent = "Edit";
		editBtn.className =
			"bg-black text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-800";
		editBtn.onclick = () => {
			editingSessionId = session.id;
			const drivers = session.drivers.map((driver) => driver.name);

			document.getElementById("add-form").classList.add("hidden");
			document.getElementById("edit-form").classList.remove("hidden");
			document.getElementById("edit-input").value = drivers.join(", ");
			document.getElementById("edit-input").focus();
		};

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "Delete";
		deleteBtn.className =
			"bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700";
		deleteBtn.onclick = () => {
			if (confirm(`Delete Race #${session.id}?`)) {
				socket.emit("delete session", session.id);
			}
		};

		const canEdit =
			session.state === "next-race" || session.state === "pending";

		if (!canEdit) {
			editBtn.disabled = true;
			deleteBtn.disabled = true;
			editBtn.classList.add("opacity-50", "cursor-not-allowed");
			deleteBtn.classList.add("opacity-50", "cursor-not-allowed");
		}

		btnContainer.appendChild(editBtn);
		btnContainer.appendChild(deleteBtn);

		header.appendChild(titleSection);
		header.appendChild(btnContainer);

		const driversList = document.createElement("div");
		driversList.className = "flex flex-col gap-2";

		if (session.drivers.length === 0) {
			const emptyMsg = document.createElement("p");
			emptyMsg.className = "text-gray-500 text-sm italic";
			emptyMsg.textContent = "No drivers assigned";
			driversList.appendChild(emptyMsg);
		} else {
			session.drivers.forEach((driver, index) => {
				const driverRow = document.createElement("div");
				driverRow.className =
					"flex justify-between items-center py-1.5 px-2 hover:bg-gray-50 rounded";

				const driverInfo = document.createElement("div");
				driverInfo.className = "flex gap-3 items-center";

				const carBadge = document.createElement("span");
				carBadge.className =
					"bg-black text-white px-2 py-1 rounded text-xs font-bold";
				carBadge.textContent = `Car ${driver.car}`;

				const name = document.createElement("p");
				name.className = "font-medium";
				name.textContent = driver.name;

				driverInfo.appendChild(carBadge);
				driverInfo.appendChild(name);

				const removeBtn = document.createElement("button");
				removeBtn.textContent = "×";
				removeBtn.className =
					"bg-red-600 text-white w-6 h-6 rounded hover:bg-red-700 font-bold";
				removeBtn.onclick = () => {
					if (confirm(`Remove ${driver.name} from this session?`)) {
						socket.emit("remove driver", session.id, index);
					}
				};

				if (!canEdit) {
					removeBtn.disabled = true;
					removeBtn.classList.add("opacity-50", "cursor-not-allowed");
				}

				driverRow.appendChild(driverInfo);
				driverRow.appendChild(removeBtn);
				driversList.appendChild(driverRow);
			});
		}

		sessionDiv.appendChild(header);
		sessionDiv.appendChild(driversList);
		container.appendChild(sessionDiv);
	});
}
