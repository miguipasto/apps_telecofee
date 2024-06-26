import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { DataService } from '../services/data.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignUpPage implements OnInit {

  formReg!: FormGroup


  constructor(private router: Router, private userService: UserService, private formBuilder: FormBuilder, private dataService: DataService, public alertController: AlertController) {

  }

  ngOnInit(): void {
    this.formReg = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    if (this.formReg.invalid) {
      this.presentAlert("Error", "Por favor, rellena todos los campos")
      this.formReg.reset();
      return;
    }
    this.userService.register(this.formReg.value)
      .then(response => {
        //Creamos su entrada en la base de datos
        const uid = response.user.uid;
        const nombre = (this.formReg.value.name).split(" ")[0];
        var apellidos = (this.formReg.value.name).split(" ")[1];
        if (apellidos == undefined) {
          apellidos = "";
        }

        this.dataService.crearUsuario(uid, nombre, apellidos, this.formReg.value.email)
        localStorage.setItem('isUserLoggedIn', 'true');
        localStorage.setItem('uid', response.user.uid);
        this.router.navigate(['main']);
      })
      .catch(error => {
        console.log(error);
        this.presentAlert("Error", "Email o contraseña inválidos. Por favor, inténtelo de nuevo.\n La contraseña debe tener 6 caracteres")
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

  redirigir_home_login() {
    this.router.navigate(['login']);
    this.formReg.reset();
  }

  resetForm() {
    this.formReg.reset();
  }

}
