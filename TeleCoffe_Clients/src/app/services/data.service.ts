import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(public firestore: Firestore) { }

  async crearIncidencia(nombre: string, descripcion: string) {
    const docRef = await addDoc(collection(this.firestore, 'incidencias'), {
      nombre: nombre,
      descripcion: descripcion
    });
    console.log("Document written with ID: ", docRef.id);
  }

  async crearUsuario(nombre: string, apellidos: string, email:string) {
    const docRef = await addDoc(collection(this.firestore, 'usuarios'), {
      nombre: nombre,
      apellidos:apellidos,
      email:email,
      saldo:0,
      create_at:new Date()
      
    });
    console.log("Document written with ID: ", docRef.id);
  }
}
