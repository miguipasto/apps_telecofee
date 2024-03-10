import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignUpPage implements OnInit{

  formReg!: FormGroup
 

  constructor(private router: Router, private userService: UserService, public formBuilder: FormBuilder) {

  }
 

  ngOnInit(): void {
    this.formReg = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (this.formReg.invalid) {
      alert('Please fill in all fields');
      this.formReg.reset();
      return;
    }
    this.userService.register(this.formReg.value)
      .then(response => {
        console.log(response);
        this.router.navigate(['login']);
      })
      .catch(error => {
        console.log(error);
        // Si hay un error en el inicio de sesión, muestra un mensaje de error
        alert('Invalid email or password. Password must have at least 6 characters. Please try again.');
        this.formReg.reset();
      });
  }

  redirigir_home_login() {
    this.router.navigate(['login']);
    this.formReg.reset();
  }

  resetForm() {
    this.formReg.reset();
  }
  
}
