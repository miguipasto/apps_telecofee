import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://83.35.235.160:5000/api'; // Reemplaza con la URL de tu servidor API

  constructor(private http: HttpClient) { }

  api() : Observable<any> {
    return this.http.get(`${this.apiUrl}`);
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

  niveles(nombre_maquina: string, fecha: string, cantidad: string): Observable<any> {
    let queryParams = '';

    if (nombre_maquina.length > 0) {
      queryParams += `nombre_maquina=${encodeURIComponent(nombre_maquina)}`;
    }

    if (fecha.length > 0) {
      if (queryParams.length > 0) queryParams += '&';
      queryParams += `fecha=${encodeURIComponent(fecha)}`;
    }

    if (cantidad.length > 0) {
      if (queryParams.length > 0) queryParams += '&';
      queryParams += `cantidad=${encodeURIComponent(cantidad)}`;
    }

    const url = `${this.apiUrl}/niveles${queryParams.length > 0 ? '?' + queryParams : ''}`;
    return this.http.get<any>(url);
  }

}
