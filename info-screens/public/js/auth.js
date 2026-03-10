class Auth {
	constructor(interfaceName, onSuccess) {
		this.interfaceName = interfaceName;
		this.onSuccess = onSuccess;
		this.socket = null;
	}

	initialize(formId, errorSelector, mainContentId) {
		this.formId = formId;
		this.errorSelector = errorSelector;
		this.mainContentId = mainContentId;

		const form = document.getElementById(formId);
		const errorElement = form.querySelector(errorSelector);

		if (errorElement) {
			errorElement.classList.add("hidden");
		}

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const input = form.querySelector('input[type="password"]');
			this.authenticate(input.value);
		});
	}

	authenticate(accessKey) {
		this.showLoading(true);
		this.socket = io();

		this.socket.emit("authenticate", {
			interface: this.interfaceName,
			accessKey: accessKey,
		});

		this.socket.on("auth-success", () => {
			this.hideAuth();
			this.onSuccess(this.socket);
		});

		this.socket.on("auth-failure", (data) => {
			this.showLoading(false);
			this.showError(data.message || "Incorrect access key");
			this.socket.disconnect();
			this.socket = null;
		});

		this.socket.on("connect_error", () => {
			this.showLoading(false);
			this.showError("Connection failed. Please try again.");
			this.socket.disconnect();
			this.socket = null;
		});
	}

	hideAuth() {
		document.getElementById(this.formId).classList.add("hidden");
		document.getElementById(this.mainContentId).classList.remove("hidden");
	}

	showError(message) {
		const form = document.getElementById(this.formId);
		const errorElement = form.querySelector(this.errorSelector);
		if (errorElement) {
			errorElement.textContent = message;
			errorElement.classList.remove("hidden");
		}
	}

	showLoading(isLoading) {
		const form = document.getElementById(this.formId);
		const btn = form.querySelector('button[type="submit"]');
		const input = form.querySelector('input[type="password"]');

		btn.disabled = isLoading;
		input.disabled = isLoading;
		btn.textContent = isLoading ? "Authenticating..." : "Unlock";

		if (isLoading) {
			btn.classList.add("opacity-50", "cursor-not-allowed");
		} else {
			btn.classList.remove("opacity-50", "cursor-not-allowed");
		}
	}
}
