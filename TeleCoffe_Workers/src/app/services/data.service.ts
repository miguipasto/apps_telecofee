import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, setDoc, doc, getDoc, updateDoc, query, getDocs } from '@angular/fire/firestore';
import { UserService } from './user.service'; 

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(public firestore: Firestore, private userService: UserService) { }

  async VerIncidencia() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'incidencias'));
      const incidencias: any[] = [];
      querySnapshot.forEach((doc) => {
        incidencias.push(doc.data());
      });
      return incidencias;
    } catch (error) {
      console.error("Error al obtener las incidencias: ", error);
      return null;
    }
  }

  async obetenerDatosUsuario() {

    const uid = this.userService.getUserUid();
    if (!uid) {
      console.error('No hay un usuario autenticado.');
      return;
    }

    const docRef = doc(this.firestore, 'usuarios', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Usuario encontrado:", docSnap.data());
        return docSnap.data();
      } else {
        console.log("No se encontró ningún usuario con ese UID.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      return null;
    }
  }

  
}
