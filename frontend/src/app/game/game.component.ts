declare var Tone: any;
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";

@Component({
  templateUrl: "game.html",
  styleUrls: ["game.css"],
})
export class GameComponent implements OnInit {
  @ViewChild("canvas", { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  keyCount = 0;
  data: any;
  player: any;
  players: any[];
  context?: CanvasRenderingContext2D | null;
  keys = ["A", "S", "D", "F", "J", "K", "L"];
  synth = new Tone.Synth().toDestination();

  constructor() {
    this.player = {
      score: 0,
      color: "blue",
      name: "Thiago",
    };
    this.players = [this.player];
    this.data = {
      notes: ["E4", "E4", "E4", "B4", "E4", "G4"],
      score: 50,
    };
  }

  ngOnInit(): void {
    this.context = this.canvas.nativeElement.getContext("2d");
    document.addEventListener("keypress", this.onKeyPress.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
    this.animate();
    this.displayNotes();
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
    const steps = (canvasWidth - finishLine - radius * 2) / this.data.score;
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
          player.name,
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
      const rightNote = this.data.notes[this.keyCount % this.data.notes.length];
      if (note?.[0] == rightNote[0]) {
        keys[index].classList.add("right");
        this.synth.triggerAttackRelease(rightNote, "8n");
        if (this.player.score < this.data.score) this.player.score++;
        this.keyCount++;
      } else {
        keys[index].classList.add("wrong");
        if (this.player.score > 0) this.player.score--;
      }
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
    const arr: any[] = [...this.data.notes];
    const index = this.keyCount % this.data.notes.length;
    if (index) {
      const elements = arr.splice(0, index);
      arr.push(...elements);
    }
    return arr;
  }
}
