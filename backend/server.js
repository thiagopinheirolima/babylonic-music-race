const PORT = process.env.PORT || 3000;

const WAITING = "WAITING";
const GAME_RUNNING = "GAME_RUNNING";
const GAME_ENDED = "GAME_ENDED";

let GAME_STATE = WAITING;
let CURRENT_GAME = null;

const path = require("path");
const http = require("http");
const cors = require("cors");
const io = require("socket.io");
const express = require("express");
const games = require("./games.json");

const app = express();
const httpServer = http.createServer(app);
const socketServer = io(httpServer, { cors: {} });

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

socketServer.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("login", (nickname) => playerLogin(socket, nickname));
  socket.on("start-game", startGame);
  socket.on("disconnect", checkGame);
  socket.on("score", (score) => updateScore(socket.player, score));
  socket.emit("current-state", GAME_STATE);
});

httpServer.listen(PORT, () =>
  console.log(`App running at http://localhost:${PORT}`)
);

function playerLogin(socket, nickname) {
  if (!socket.player) {
    socket.player = {
      nickname,
      color: getRandomColor(),
    };
  }

  console.log(`${socket.player.nickname} logged in`);
  socket.player.score = 0;
  socket.join(WAITING);
  socket.leave(GAME_ENDED);
  notifyPlayerState(WAITING);
  listPlayers(WAITING);
}

function notifyPlayerState(room) {
  socketServer.to(room).emit("state", room);
}

function updateScore(player, score) {
  if (player.score + score >= 0 && player.score + score <= CURRENT_GAME.score) {
    player.score += score;
    if (player.score == CURRENT_GAME.score) endGame(player);
    listPlayers(GAME_RUNNING);
  }
}

async function listPlayers(room) {
  if (room) {
    const sockets = await socketServer.in(room).fetchSockets();
    const players = sockets.map((_) => _.player);
    socketServer.to(room).emit("players", players);
  }
}

function startGame() {
  if (GAME_STATE == WAITING) {
    socketServer.in(WAITING).socketsJoin(GAME_RUNNING);
    socketServer.in([WAITING, GAME_RUNNING]).socketsLeave(WAITING);
    changeGameState(GAME_RUNNING);
    const index = Math.floor(Math.random() * games.length);
    CURRENT_GAME = games[index];
    socketServer.to(GAME_RUNNING).emit("game", CURRENT_GAME);
    notifyPlayerState(GAME_RUNNING);
  }
}

function endGame(player) {
  if (GAME_STATE == GAME_RUNNING) {
    socketServer.in(GAME_RUNNING).socketsJoin(GAME_ENDED);
    socketServer.in([GAME_RUNNING, GAME_ENDED]).socketsLeave(GAME_RUNNING);
    changeGameState(WAITING);

    socketServer
      .to(GAME_ENDED)
      .emit("game", { winner: player, ...CURRENT_GAME });
    notifyPlayerState(GAME_ENDED);
  }
}

function getRandomColor() {
  return `#${[1, 2, 3, 4, 5, 6]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")}`;
}

async function checkGame() {
  const sockets = await socketServer.in(GAME_RUNNING).fetchSockets();
  if (sockets.length == 0) {
    changeGameState(WAITING);
  }
}

function changeGameState(state) {
  GAME_STATE = state;
  socketServer.emit("current-state", GAME_STATE);
}
