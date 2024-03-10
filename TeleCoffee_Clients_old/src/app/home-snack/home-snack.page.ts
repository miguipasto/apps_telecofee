import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home.snack',
  templateUrl: 'home-snack.page.html',
  styleUrls: ['home-snack.page.scss'],
})
export class HomeSnackPage {

  constructor(private router: Router) {}

  redirigir_home() {
    this.router.navigate(['home']);
  }
  redirigir_drink() {
    this.router.navigate(['home-drink']);
  }

  redirigir_soporte() {
    this.router.navigate(['soporte']);
  }
}
