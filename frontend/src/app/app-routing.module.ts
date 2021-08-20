import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EndedComponent } from './ended/ended.component';
import { GameComponent } from "./game/game.component";
import { LoginComponent } from "./login/login.component";
import { TutorialComponent } from "./tutorial/tutorial.component";
import { WaitingComponent } from "./waiting/waiting.component";

const routes: Routes = [
  { path: "tutorial", component: TutorialComponent },
  { path: "game", component: GameComponent },
  { path: "login", component: LoginComponent },
  { path: "winner", component: EndedComponent },
  { path: "waiting", component: WaitingComponent },
  { path: "**", redirectTo: "tutorial" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
