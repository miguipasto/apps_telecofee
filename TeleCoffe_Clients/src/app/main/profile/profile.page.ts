import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  cadena: string="";
  isOverlayVisible: boolean=false;
  formPassword!: FormGroup;
  datosUser: any = [];

  constructor(
    public authService: UserService,
    public route: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService) { }

  async ngOnInit() {
    this.formPassword=new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required)
      
    });

    this.datosUser = await this.dataService.obetenerDatosUsuario();
  }


  showOverlay(cadena: string) {
    if (cadena.includes('contraseña')) {
      console.log(this.formPassword.value.newPassword);
      console.log(this.formPassword.value.currentPassword);
  
      if (this.formPassword.invalid) {
        const currentPasswordErrors = this.formPassword?.get('currentPassword')?.errors;
        let errorMessage = 'Please fill in all fields or fix errors.';
        if (currentPasswordErrors) {
          errorMessage = Object.keys(currentPasswordErrors)[0] === 'required'
            ? 'Current password is required.'
            : 'There are errors in current password.';
        }
        alert(errorMessage);
        this.formPassword.reset();
        return;
      }
    }
    this.isOverlayVisible = true;
    this.cadena = cadena;
  }
  
  
  Confirm(cadena:string) {
    if(cadena.includes('Eliminar')){
      this.authService.deleteAccount();
    } else {
      const np=this.formPassword.value.currentPassword
      const op=this.formPassword.value.newPassword

      this.authService.reauthenticateWithCredential(np,op)

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

