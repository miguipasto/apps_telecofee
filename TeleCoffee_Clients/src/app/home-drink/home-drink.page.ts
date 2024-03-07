import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home.drink',
  templateUrl: 'home-drink.page.html',
  styleUrls: ['home-drink.page.scss'],
})
export class HomeDrinkPage {

  constructor(private router: Router) {}

  redirigir_snack() {
    this.router.navigate(['home-snack']);
  }
  redirigir_home() {
    this.router.navigate(['home']);
  }

  redirigir_soporte() {
    this.router.navigate(['soporte']);
  }
}
