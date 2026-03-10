const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
require("dotenv").config();
const data = require("./data");
const { setUpSocketEvents } = require("./socket-events");
const { validateAccessKeys } = require("./auth");
const { updateSessionsFromDB } = require("./state");

validateAccessKeys();

const app = express();
const server = createServer(app);
const io = new Server(server);

updateSessionsFromDB(data.handleDB());

app.use((req, res, next) => {
	const path = req.path;

	if (path.includes(".") || path === "/" || path.startsWith("/socket.io")) {
		return next();
	}

	req.url = path + ".html";
	next();
});

app.use(express.static(join(__dirname, "..", "public")));

setUpSocketEvents(io);

server.listen(3000, () => {
	console.log("Server running at http://localhost:3000");
});
