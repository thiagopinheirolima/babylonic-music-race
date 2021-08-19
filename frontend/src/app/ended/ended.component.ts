import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SocketService } from "../services/socket.service";

@Component({
  templateUrl: "ended.html",
})
export class EndedComponent {
  game;

  constructor(private socketService: SocketService, private router: Router) {
    if (this.socketService.connected) {
      this.game = this.socketService.game.asObservable();
    } else {
      this.router.navigate(["/", "login"]);
    }
  }

  again() {
    this.socketService.login();
  }
}
