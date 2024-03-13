import { Component} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage {

  constructor(private router: Router) {}

  redirigir_start_login() {
    this.router.navigate(['login']);
  }

  redirigir_start_signup() {
    this.router.navigate(['signup']);
  }


}
