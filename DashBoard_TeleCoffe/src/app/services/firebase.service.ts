import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendPasswordResetEmail, deleteUser, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, setDoc, doc, collection, getDocs } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(public auth: Auth, public firestore: Firestore) {}

  registerUserAuth(email: string, password: string){
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async registerUserFireStore(uid: string, nombre: string, apellidos: string, email: string) {
    try {
      await setDoc(doc(this.firestore, 'usuarios', uid), {
        nombre,
        apellidos,
        email,
        create_at: new Date()
      });
      console.log("Usuario creado con ID: ", uid);
    } catch (error) {
      console.error("Error al crear el usuario: ", error);
    }
  }

  getAllUsers(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'usuarios');
    return new Observable((observer) => {
      getDocs(usersRef)
        .then(snapshot => {
          const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          observer.next(users);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  resetPassword(email: string) {
    return from(sendPasswordResetEmail(this.auth, email));
  }

}
