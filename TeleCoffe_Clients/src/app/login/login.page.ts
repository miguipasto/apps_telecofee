import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage implements OnInit {

  formLogIn!: FormGroup;


  constructor(private router: Router, private userService: UserService, public formBuilder: FormBuilder, public alertController: AlertController) {}

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
      //alert('Por favor rellene todos los campos');
      this.presentAlert("Error","Por favor, rellena todos los campos")
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
        //alert('Contraseña o correo inválido. Por favor vuelva a intentarlo.');
        this.presentAlert("Error","Email o contraseña inválidos. Por favor, inténtelo de nuevo.")
        this.formLogIn.reset();
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
