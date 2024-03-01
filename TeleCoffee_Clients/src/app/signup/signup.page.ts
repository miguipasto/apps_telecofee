import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignUpPage {

  constructor(private router: Router) {}

  redirigir_home_login() {
    this.router.navigate(['login']);
  }

}
