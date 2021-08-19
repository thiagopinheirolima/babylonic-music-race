import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SocketService } from "../services/socket.service";

@Component({
  templateUrl: "waiting.html",
})
export class WaitingComponent {
  players;
  state;

  constructor(private socketService: SocketService, private router: Router) {
    if (this.socketService.connected) {
      this.players = this.socketService.players.asObservable();
      this.state = this.socketService.currentState.asObservable();
    } else {
      this.router.navigate(["/", "login"]);
    }
  }

  startGame() {
    this.socketService.startGame();
  }
}
