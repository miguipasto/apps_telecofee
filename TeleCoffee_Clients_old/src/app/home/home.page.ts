import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private router: Router) {}

  redirigir_home_login() {
    this.router.navigate(['login']);
  }

  redirigir_home_signup() {
    this.router.navigate(['signup']);
  }

  redirigir_snack() {
    this.router.navigate(['home-snack']);
  }
  redirigir_drink() {
    this.router.navigate(['home-drink']);
  }

  redirigir_soporte() {
    this.router.navigate(['soporte']);
  }

}
