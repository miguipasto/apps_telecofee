import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgotPassword',
  templateUrl: 'forgotPassword.page.html',
  styleUrls: ['forgotPassword.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  formForgotPassword!: FormGroup;
  

  constructor(private router: Router,private userService:UserService, public formBuilder: FormBuilder,  public alertController: AlertController){
    
  }
  ngOnInit(): void {
    this.formForgotPassword=new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    })
  }


  onSubmit() {
    if (this.formForgotPassword.invalid) {
      this.presentAlert("Error","Por favor, rellena todos los campos")
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
        this.presentAlert("Error","Email o contraseña inválidos. Por favor, inténtelo de nuevo.")
        this.formForgotPassword.reset();
      });
  }
  
  async presentAlert(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  

  redirigir_home_signup() {
    this.router.navigate(['signup']);
    this.formForgotPassword.reset();
  }

  resetForm() {
    this.formForgotPassword.reset();
  }

  redirigir_maquinas() {
    this.router.navigate(['login']);
    this.formForgotPassword.reset();
  }

  
}
