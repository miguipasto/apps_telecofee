import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-soporte',
  templateUrl: 'soporte.page.html',
  styleUrls: ['soporte.page.scss'],
})
export class SoportePage {

  constructor(private router: Router) {}


  redirigir_home() {
    this.router.navigate(['home']);
  }


}
