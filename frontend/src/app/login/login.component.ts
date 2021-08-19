import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SocketService } from "../services/socket.service";

@Component({
  templateUrl: "login.html",
})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private socketService: SocketService
  ) {
    this.form = this.formBuilder.group({
      nickname: ["", Validators.required],
    });
  }

  onSubmit() {
    this.socketService.login(this.form.value.nickname);
  }
}
