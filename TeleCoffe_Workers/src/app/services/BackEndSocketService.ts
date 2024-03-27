import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendSocketsService {
  private apiUrl = 'http://83.35.221.176:5000/api'; // Reemplaza con la URL de tu servidor API

  constructor(private http: HttpClient) { }

  async obtenerIncidencias() {
    console.log(`${this.apiUrl}/incidencias`)
    try { 
        const response = await this.http.get<any[]>(`${this.apiUrl}/incidencias`).toPromise();
        const datosIncidencia: { descripcion: string; fecha: any; maquina: string, email: string; enviado: boolean}[]=[];
  

        response?.forEach((data) => {
          const datos= {
            descripcion: data.descripcion,
            fecha: data.create_at,
            maquina: data.maquina,
            email: data.email,
            enviado: false
          }

          datosIncidencia.push(datos)
          

        })
        console.log(datosIncidencia)
        return  datosIncidencia;
     
    } catch (error) {
      console.error("Error al obtener las incidencias: ", error);
      throw error; // Re-lanzar el error para que el componente pueda manejarlo
    }
  }
}

function data(descripcion: string[], create_at: Date, maquina: string, email: string): void {
  throw new Error('Function not implemented.');
}
