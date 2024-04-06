import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-forgotPassword',
  templateUrl: 'forgotPassword.page.html',
  styleUrls: ['forgotPassword.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  formForgotPassword!: FormGroup;
  

  constructor(private router: Router,private userService:UserService,public formBuilder: FormBuilder){
    
  }
  ngOnInit(): void {
    this.formForgotPassword=new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),

    })
  }


  onSubmit() {
    if (this.formForgotPassword.invalid) {
      alert('Please fill in all fields');
      this.formForgotPassword.reset();
      return;
    }
    console.log(this.formForgotPassword.value)
    const email=JSON.stringify((this.formForgotPassword.value).email)
    this.userService.resetPassword(email.replace(/^"(.*)"$/, '$1'))
      .then(response => {
        console.log(response);
        this.router.navigate(['login']);
      })
      .catch(error => {
        console.log(error);
        // Si hay un error en el inicio de sesión, muestra un mensaje de error
        alert('Invalid email or password. Please try again.');
        this.formForgotPassword.reset();
      });
  }
  


  redirigir_home_signup() {
    this.router.navigate(['signup']);
    this.formForgotPassword.reset();
  }

  redirigir_maquinas() {
    this.router.navigate(['login']);
    this.formForgotPassword.reset();
  }
  

  resetForm() {
    this.formForgotPassword.reset();
  }


  
}
