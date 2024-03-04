import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  redirigir_home_signup() {
    this.router.navigate(['signup']);
  }

  validateForm() {
    if (this.email === '' || this.password === '') {
      alert('Please fill in all fields');
    }
  }

  onFocusEmail() {
    if (this.email === 'E-Mail') {
      this.email = '';
    }
  }

  onBlurEmail() {
    if (this.email === '') {
      this.email = 'E-Mail';
    }
  }
}
