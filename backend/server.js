const PORT = process.env.PORT || 3000;

const path = require("path");
const http = require("http");
const io = require("socket.io");
const express = require("express");

const app = express();
const httpServer = http.createServer(app);
const socketServer = io(httpServer);

app.use(express.static(path.join(__dirname, "public")));

socketServer.on("connection", (socket) => {
  console.log("New client");
  socket.on("login", (nickname) => console.log(nickname));
});

httpServer.listen(PORT, () =>
  console.log(`App running at http://localhost:${PORT}`)
);
