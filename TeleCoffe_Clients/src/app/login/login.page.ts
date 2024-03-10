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

  constructor(private router: Router,private userService:UserService,public formBuilder: FormBuilder) {
    
  }
  ngOnInit(): void {
    this.formLogIn=new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    })
  }


  onSubmit() {
    if (this.formLogIn.invalid) {
      alert('Please fill in all fields');
      this.formLogIn.reset();
      return;
    }
    this.userService.logIn(this.formLogIn.value)
      .then(response => {
        console.log(response);
        this.router.navigate(['main']);
      })
      .catch(error => {
        console.log(error);
        // Si hay un error en el inicio de sesión, muestra un mensaje de error
        alert('Invalid email or password. Please try again.');
        this.formLogIn.reset();
      });
  }


  redirigir_home_signup() {
    this.router.navigate(['signup']);
    this.formLogIn.reset();
  }

  resetForm() {
    this.formLogIn.reset();
  }
  
  
}
