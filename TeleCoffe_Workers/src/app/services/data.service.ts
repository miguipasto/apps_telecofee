import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, setDoc, doc, getDoc, updateDoc, query, getDocs } from '@angular/fire/firestore';
import { UserService } from './user.service'; 

@Injectable({
  providedIn: 'root'
})
export class DataService {
  

  constructor(public firestore: Firestore, private userService: UserService) { }

  async actualizarNiveles(data: any, nombreMaquina: string) {
    
    const uid = this.userService.getUserUid();
    if (!uid) {
      console.error('No hay un usuario autenticado.');
      return;
    }
  
    // Comprobamos el saldo del cliente
    const datosUser: any = await this.obetenerDatosUsuario();

      // Obtener la fecha actual en formato ISO
    const fechaActual = new Date().toISOString();

      // Nombre del reponedor (puedes cambiarlo según sea necesario)
    const nombreReponedor = datosUser.nombre + "" + datosUser.apellidos;
    
      // Modificar la variable niveles para agregar la fecha y el reponedor
      data.fecha = fechaActual;
      data.reponedor = nombreReponedor;
      delete data.maquina;

      console.log(data)
    
  
      // Referencia a la subcolección de niveless para el usuario actual
      const nivelessRef = collection(this.firestore, `niveles/${nombreMaquina.toLocaleLowerCase()}/historial_reposiciones`);
  
      try {
        const docRef = await addDoc(nivelessRef, data);
        console.log("niveles registrada con ID: ", docRef.id);
        // Actualiza el contador de niveless aquí si es necesario
        return docRef.id;
      } catch (error) {
        console.error("Error al crear la niveles:", error);
        return null;
      }
    }
  
  
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
