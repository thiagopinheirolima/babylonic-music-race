declare var Tone: any;
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Game, Player, SocketService } from "../services/socket.service";

@Component({
  templateUrl: "game.html",
  styleUrls: ["game.css"],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild("canvas", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  keyCount = 0;
  context?: CanvasRenderingContext2D | null;
  keys = ["A", "S", "D", "F", "J", "K", "L"];
  synth = new Tone.Synth().toDestination();

  game!: Game;
  players!: Player[];
  subscriptions: Subscription[] = [];
  onKeyPressBinding: any;
  onKeyUpBinding: any;

  constructor(private socketService: SocketService, private router: Router) {
    if (this.socketService.connected) {
      this.subscriptions.push(
        this.socketService.game.subscribe((game) => {
          this.game = game;
          if (!game) {
            this.router.navigate(["/", "login"]);
          }
        }),
        this.socketService.players.subscribe((players) => {
          this.players = players;
        })
      );
    } else {
      this.router.navigate(["/", "login"]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    document.removeEventListener("keypress", this.onKeyPressBinding);
    document.removeEventListener("keyup", this.onKeyUpBinding);
  }

  ngOnInit(): void {
    this.context = this.canvas.nativeElement.getContext("2d");
    this.onKeyPressBinding = this.onKeyPress.bind(this);
    this.onKeyUpBinding = this.onKeyUp.bind(this);
    document.addEventListener("keypress", this.onKeyPressBinding);
    document.addEventListener("keyup", this.onKeyUpBinding);
    this.animate();
  }

  animate() {
    this.clear();
    this.drawFinishLine();
    this.drawPlayers(this.players);
    requestAnimationFrame(this.animate.bind(this));
  }

  clear(): void {
    if (this.context) {
      this.context.fillStyle = "#FFF";
      this.context.clearRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
      this.context.fillRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
    }
  }

  drawFinishLine() {
    if (this.context) {
      this.context.fillStyle = "#000";
      for (let i = 0; i < this.context.canvas.height; i += 10) {
        this.context.fillRect(this.context.canvas.width - 5, 0 + i, 5, 5);
        this.context.fillRect(this.context.canvas.width - 10, 5 + i, 5, 5);
        this.context.fillRect(this.context.canvas.width - 15, 0 + i, 5, 5);
        this.context.fillRect(this.context.canvas.width - 20, 5 + i, 5, 5);
      }
    }
  }

  drawPlayers(players: any[]) {
    const finishLine = 20;
    const canvasWidth = this.context?.canvas.width || 0;
    const canvasHeight = this.context?.canvas.height || 0;
    const radius = Math.min(canvasWidth / (this.players.length * 4), 30);
    const steps =
      (canvasWidth - finishLine - radius * 2) / (this.game?.score || 10);
    const spacer = canvasHeight / this.players.length;
    players.forEach((player: any, index: number) => {
      if (this.context) {
        this.context.strokeStyle = player.color;
        this.context.fillStyle = player.color;
        this.context.beginPath();
        this.context.arc(
          radius + steps * player.score,
          radius + spacer * index,
          radius,
          0,
          Math.PI * 2,
          false
        );
        this.context.stroke();
        this.context.fillText(
          player.nickname,
          2 + steps * player.score,
          2 + radius + spacer * index,
          radius - 4
        );
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    const index = this.keys.indexOf(event.key.toUpperCase());
    if (index > -1) {
      const keys = document.getElementsByClassName("key");
      const note = keys[index].getAttribute("data-note");
      const rightNote =
        this.game?.notes[this.keyCount % this.game.notes.length];
      let score = 0;
      if (note?.[0] == rightNote?.[0]) {
        keys[index].classList.add("right");
        this.synth.triggerAttackRelease(rightNote, "8n");
        score = 1;
        this.keyCount++;
      } else {
        keys[index].classList.add("wrong");
        score = -1;
      }
      this.socketService.sendScore(score);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    const index = this.keys.indexOf(event.key.toUpperCase());
    if (index > -1) {
      const keys = document.getElementsByClassName("key");
      keys[index].classList.remove("right");
      keys[index].classList.remove("wrong");
    }
  }

  displayNotes() {
    const arr: any[] = [...(this.game?.notes || [])];
    const index = this.keyCount % (this.game?.notes?.length || this.keyCount);
    if (index) {
      const elements = arr.splice(0, index);
      arr.push(...elements);
    }
    return arr.length > 10 ? arr.slice(0, 10) : arr;
  }
}
