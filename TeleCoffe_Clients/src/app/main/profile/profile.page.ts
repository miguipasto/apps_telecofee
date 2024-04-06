import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  cadena: string = "";
  isOverlayVisible: boolean = false;
  formPassword!: FormGroup;
  datosUser: any = [];

  constructor(
    public authService: UserService,
    public route: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    public alertController: AlertController) { }

  async ngOnInit() {  
    this.formPassword = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required)
    });

    this.datosUser = await this.dataService.obetenerDatosUsuario();
  }


  showOverlay(cadena: string) {
    if (cadena.includes('contraseña')) {

      //console.log("Nueva " + this.formPassword.value.newPassword);
      //console.log("Actual " + this.formPassword.value.currentPassword);
  
      if (this.formPassword.invalid) {
        const currentPasswordErrors = this.formPassword?.get('currentPassword')?.errors;
        let errorMessage = 'Por favor rellene todos los campos o corrija errores.';
        if (currentPasswordErrors) {
          errorMessage = Object.keys(currentPasswordErrors)[0] === 'required'
            ? 'Contraseña actual es obligatoria.'
            : 'Hay errores en la contraseña actual.';
        }
        //alert(errorMessage);
        this.presentAlert("Error",errorMessage)
        this.formPassword.reset();
        return;
      }
    }
    this.isOverlayVisible = true;
    this.cadena = cadena;
  }

  async presentAlert(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  
  
  async Confirm(cadena: string) {
    if (cadena.includes('Eliminar')) {
      await this.authService.deleteAccount().then(async () => {
        await this.dataService.borrarUsuario().then(() => {
          console.log('Cuenta eliminada');
          //alert('Cuenta eliminada con éxito');
          this.presentAlert("Cuenta eliminada correctamente","Gracias.")
          this.route.navigate(['login']);
        })
        
      }).catch(error => {
        console.error('Error al eliminar la cuenta', error);
        //alert('Error al eliminar la cuenta');
        this.presentAlert("Error","No hemos podido eliminar su cuenta.")
      });
    }else{
      const np=this.formPassword.value.currentPassword
      const op=this.formPassword.value.newPassword

      this.authService.reauthenticateWithCredential(np,op);
      this.formPassword.reset();


    }
    this.isOverlayVisible = false;
  }
  

  Cancel() {
    this.isOverlayVisible = false;
  }

  LogOut(){
    this.authService.signOut();
    this.route.navigate(['login'])
  }

}

