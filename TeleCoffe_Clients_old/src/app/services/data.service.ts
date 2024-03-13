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
}
