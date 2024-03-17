import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit{

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const isUserLoggedIn = localStorage.getItem('isUserLoggedIn');
    if (isUserLoggedIn) {
      this.router.navigate(['main']);
    }
  }

  redirigir_start_login() {
    this.router.navigate(['login']);
  }

  redirigir_start_signup() {
    this.router.navigate(['signup']);
  }


}
