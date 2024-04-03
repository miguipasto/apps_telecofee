import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, deleteUser, updatePassword, getAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  constructor(public auth: Auth) {}

  register({email, password }: any) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logIn({email, password }: any) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  
  signOut() {
    return this.auth.signOut().then(() => {
    localStorage.removeItem('isUserLoggedIn');
    });
  }

  resetPassword(email: any) {
    return sendPasswordResetEmail(this.auth, email)
  }

  getProfile() {
    const auth = getAuth();
    return auth.currentUser;
  }

  getUserUid(): string | null {
    const user = localStorage.getItem('uid');
    return user;
  }

  updatePassword(user: any, newPassword: string) {
    return updatePassword(user, newPassword).then(() => {
      console.log('Contraseña actualizada correctamente');
      alert('Contraseña actualizada correctamente');
    }).catch((error) => {
      console.error(error);
      console.log('Contraseña no válida');
      alert('Contraseña no válida');
    });
  }
  
  async deleteAccount() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user != null) {
      return deleteUser(user).then(() => {
        console.log('Usuario eliminado exitosamente');
        //alert('Usuario eliminado exitosamente');
      }).catch((error) => {
        console.error('Usuario no eliminado', error);
        //alert('Usuario no eliminado');
      });
    }
  }

  async reauthenticateWithCredential(Currentpassword: string, newPassword: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user?.email != null) {
      return signInWithEmailAndPassword(this.auth, user.email, Currentpassword).then(() => {
        this.updatePassword(user, newPassword);
      }).catch((error) => {
        console.error("Contraseña incorrecta", error);
        alert("Contraseña incorrecta");
      });
    }
  }
}
