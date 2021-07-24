import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { GameComponent } from "./game/game.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { environment } from "src/environments/environment";
import { WaitingComponent } from './waiting/waiting.component';
import { EndedComponent } from './ended/ended.component';
const config: SocketIoConfig = { url: environment.socketURL };

@NgModule({
  declarations: [AppComponent, LoginComponent, GameComponent, WaitingComponent, EndedComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocketIoModule.forRoot(config),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
