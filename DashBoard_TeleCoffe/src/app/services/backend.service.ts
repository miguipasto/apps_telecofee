import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://83.35.221.176:5000/api'; // Reemplaza con la URL de tu servidor API

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

  // gestionarServicios(accion : string): Observable<any> {
  //   const endpoint = '/gestionar-servicios'; 
  //   const requestData = {"accion" : accion}; 

  //   return this.http.post(`${this.apiUrl}${endpoint}`, requestData);
  // }

  // recuperarLogs(): Observable<any> {
  //   const endpoint = '/logs-data';

  //   return this.http.post(`${this.apiUrl}${endpoint}`,null);
  // }

  // getLogsFileName(): Observable<any> {
  //   const endpoint = '/logs-file-name'; 

  //   return this.http.get(`${this.apiUrl}${endpoint}`);
  // }

  // getLogsFileNameContent(id:any): Observable<any> {
  //   const endpoint = `/logs-file-name-data/${id}`; // Reemplaza con la ruta deseada en tu backend

  //   return this.http.get(`${this.apiUrl}${endpoint}`);
  // }
}
