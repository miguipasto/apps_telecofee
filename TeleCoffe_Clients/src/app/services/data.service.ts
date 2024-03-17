import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, setDoc, doc, getDoc, updateDoc, query, getDocs } from '@angular/fire/firestore';
import { UserService } from './user.service'; 

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(public firestore: Firestore, private userService: UserService) { }

  async crearIncidencia(nombre: string, descripcion: string) {
    const uid = this.userService.getUserUid();
    if (!uid) {
      console.error('No hay un usuario autenticado.');
      return;
    }

    try {
      await setDoc(doc(this.firestore, 'incidencias', uid), {
        uid: uid, 
        nombre: nombre,
        descripcion: descripcion
      });
      console.log("Documento creado con ID");
    } catch (error) {
      console.error("Error al crear el documento: ", error);
    }
  }

  async crearUsuario(uid: string, nombre: string, apellidos: string, email: string) {
    try {
      await setDoc(doc(this.firestore, 'usuarios', uid), {
        nombre: nombre,
        apellidos: apellidos,
        email: email,
        saldo: 0,
        create_at: new Date()
      });
      console.log("Usuario creado con ID: ", uid);
    } catch (error) {
      console.error("Error al crear el usuario: ", error);
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

  async actualizarSaldoUsuario(nuevoSaldo: number) {
    const uid = this.userService.getUserUid();
    if (!uid) {
      console.error('No hay un usuario autenticado.');
      return;
    }
    try {
      const userDocRef = doc(this.firestore, 'usuarios', uid);
      await updateDoc(userDocRef, {
        saldo: nuevoSaldo
      });
      console.log("Saldo actualizado con éxito.");
    } catch (error) {
      console.error("Error al actualizar el saldo del usuario: ", error);
    }
  }

  async obtenerComprasUsuario() {
    const uid = this.userService.getUserUid();
    if (!uid) {
      console.error('No hay un usuario autenticado.');
      return;
    }

    // Referencia a la colección de compras del usuario específico
    const comprasRef = collection(this.firestore, `/compras/${uid}/compras`);
    try {
      // Creamos una consulta para obtener todos los documentos de la colección
      const q = query(comprasRef);
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        let compras : any = [];
        querySnapshot.forEach((doc) => {
          compras.push(doc.data());
        });
        console.log("Compras encontradas:", compras);
        return compras;
      } else {
        console.log("No se encontró ninguna compra para el usuario con ese UID.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener compras:", error);
      return null;
    }
  }

  async crearCompra(compra: any) {
    const uid = this.userService.getUserUid();
    if (!uid) {
      console.error('No hay un usuario autenticado.');
      return;
    }
  
    // Comprobamos el saldo del cliente
    const datosUser: any = await this.obetenerDatosUsuario();
    console.log(datosUser.saldo)
  
    if (datosUser.saldo < compra.precio) {
      console.log("Dinero insuficiente.")
      return null;
    } else {
      console.log("Saldo suficiente")
      
      // Actualizamos el saldo
      const nuevoSaldo = datosUser.saldo - compra.precio;
      await this.actualizarSaldoUsuario(nuevoSaldo);

      // Referencia a la subcolección de compras para el usuario actual
      const comprasRef = collection(this.firestore, `compras/${uid}/compras`);
  
      try {
        const docRef = await addDoc(comprasRef, compra);
        console.log("Compra registrada con ID: ", docRef.id);
        // Actualiza el contador de compras aquí si es necesario
        return docRef.id;
      } catch (error) {
        console.error("Error al crear la compra:", error);
        return null;
      }
    }
  }
}
