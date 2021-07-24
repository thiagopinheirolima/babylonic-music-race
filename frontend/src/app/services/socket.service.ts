import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Socket } from "ngx-socket-io";
import { BehaviorSubject } from "rxjs";

export type Player = {
  score: number;
  color: string;
  nickname: string;
};

export type Game = {
  name: string;
  score: number;
  notes: string[];
  winner?: Player;
} | null;

@Injectable({
  providedIn: "root",
})
export class SocketService {
  players = new BehaviorSubject<Player[]>([]);
  game = new BehaviorSubject<Game>(null);
  currentState = new BehaviorSubject<string>("");
  connected = false;

  constructor(private socket: Socket, private router: Router) {
    this.socket.on("players", (players: Player[]) =>
      this.players.next(players)
    );

    this.socket.on("current-state", (currentState: string) =>
      this.currentState.next(currentState)
    );

    this.socket.on("game", (game: Game) => this.game.next(game));

    this.socket.on("state", (state: string) => {
      switch (state) {
        case "GAME_RUNNING":
          this.router.navigate(["/", "game"]);
          break;
        case "GAME_ENDED":
          this.router.navigate(["/", "winner"]);
          break;
      }
    });
  }

  login(nickname?: string) {
    this.connected = true;
    this.socket.emit("login", nickname);
    this.game.next(null);
    this.router.navigate(["/", "waiting"]);
  }

  startGame() {
    this.socket.emit("start-game");
  }

  sendScore(score: number) {
    this.socket.emit("score", score);
  }
}
