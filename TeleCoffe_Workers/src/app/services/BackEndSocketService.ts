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

  compras(nombre_maquina: string, fecha: string): Observable<any> {
    let queryParams = '';

    if (nombre_maquina.length > 0) {
      queryParams += `nombre_maquina=${encodeURIComponent(nombre_maquina)}`;
    }

    if (fecha.length > 0) {
      if (queryParams.length > 0) queryParams += '&';
      queryParams += `fecha=${encodeURIComponent(fecha)}`;
    }

    const url = `${this.apiUrl}/compras${queryParams.length > 0 ? '?' + queryParams : ''}`;
    return this.http.get<any>(url);
  }

  ventas(nombre_maquina: string, fecha:string): Observable<any> {
    let queryParams = '';

    if (fecha.length > 0) {
      queryParams += `fecha=${encodeURIComponent(fecha)}`;
    }

    if (nombre_maquina.length > 0) {
      if (queryParams.length > 0) queryParams += '&';
      queryParams += `nombre_maquina=${encodeURIComponent(nombre_maquina)}`;
    }

    const url = `${this.apiUrl}/compras${queryParams.length > 0 ? '?' + queryParams : ''}`;
    console.log(url)
    return this.http.get<any>(url);
  }


  ObtenerDatos(nombre_maquina: string): Observable<any>{
    let queryParams = '';

    if (nombre_maquina.length > 0) {
      queryParams += `nombre_maquina=${encodeURIComponent(nombre_maquina)}`;
    }

    queryParams += '&';
    queryParams += `fecha=${encodeURIComponent("all")}`;
  

    queryParams += '&';
    queryParams += `cantidad=${encodeURIComponent("last")}`;

    const url = `${this.apiUrl}/niveles${queryParams.length > 0 ? '?' + queryParams : ''}`;
    return  this.http.get<any>(url);
  }

}
