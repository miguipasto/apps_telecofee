import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage implements OnInit {
  formLogIn!: FormGroup;

  constructor(private router: Router, private userService: UserService, public formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  initLoginForm(): void {
    this.formLogIn = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit(): void {
    if (this.formLogIn.invalid) {
      alert('Please fill in all fields');
      this.formLogIn.reset();
      return;
    }
    this.userService.logIn(this.formLogIn.value)
      .then((response) => {
        localStorage.setItem('isUserLoggedIn', 'true');
        localStorage.setItem('uid', response.user.uid);
        this.router.navigate(['main']);
      })
      .catch(error => {
        console.error(error);
        alert('Invalid email or password. Please try again.');
        this.formLogIn.reset();
      });
  }

  redirigir_home_signup(): void {
    this.router.navigate(['signup']);
    this.formLogIn.reset();
  }

  redirigir_forgot(): void {
    this.router.navigate(['password']);
    this.formLogIn.reset();
  }

  resetForm(): void {
    this.formLogIn.reset();
  }
}
