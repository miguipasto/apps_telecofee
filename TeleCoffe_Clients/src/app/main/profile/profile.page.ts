import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  cadena: string="";
  isOverlayVisible: boolean=false;
  formPassword!: FormGroup;

  constructor(public authService:UserService,public route:Router,private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formPassword=new FormGroup({
      newPassword: new FormControl('', Validators.required),
      currentPassword:new FormControl('', Validators.required)
    })
  }

  

  showOverlay(cadena:string) {
    if(cadena.includes('contraseña')){
      if (this.formPassword.invalid) {
        alert('Please fill in all fields');
        this.formPassword.reset();
        return;
      } 
   }
    this.isOverlayVisible = true;
    this.cadena=cadena;
  }
  
  Confirm(cadena:string) {
    if(cadena.includes('Eliminar')){
      this.authService.deleteAccount();
    }else{
      console.log(this.formPassword.value.newPassword);
      console.log(this.formPassword.value.currentPassword);
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






