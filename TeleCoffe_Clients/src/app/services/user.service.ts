import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword,signInWithEmailAndPassword} from '@angular/fire/auth';
import { sendPasswordResetEmail,deleteUser, updatePassword, getAuth, reauthenticateWithCredential, AuthCredential } from 'firebase/auth';

import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(public auth:Auth) {}

  register({email, password }: any){
    return createUserWithEmailAndPassword(this.auth, email,password);
  }

  logIn({email, password }: any){
    return signInWithEmailAndPassword(this.auth, email,password);
  }
  

  resetPassword(email: any){
    return sendPasswordResetEmail(this.auth,email)
  }
  signOut(){
    this.auth.signOut();
  }

  async deleteAccount(){
    const auth = getAuth();
    const user = auth.currentUser;
    if(user!=null){
      deleteUser(user).then(() => {
      console.log('Usuario eliminado exitosamente');

    }).catch((error) => {
      console.log('Usuario no eliminado');
    });
    }
  }

  getProfile(){
      const auth = getAuth();
      const user = auth.currentUser;

      return user;

  }

  updatePassword(user: any, newPassword:string){
    updatePassword(user,newPassword).then(() => {
      console.log('Contraseña actualizada correctamente');

    }).catch((error) => {
      console.log(error)
      console.log('Contraseña no actualizada');
    });
  }

  async reauthenticateWithCredential(Currentpassword: string, newPassword:string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;


    if(user?.email!=null){
      console.log(Currentpassword)
      
        signInWithEmailAndPassword(this.auth,user.email, Currentpassword).then(() => {
        this.updatePassword(user,newPassword);
        
      

      }).catch((error) => {

        console.log("Contraseña incorrecta")
        return;
      });
    }
  }

}
    
    
  
  

