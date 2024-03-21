import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {
  
  constructor(private dataService: DataService) { }

  ngOnInit() {
  }
 
  nombre = '';
  descripcion = '';
/*
  enviar_incidencia() {
    this.dataService.crearIncidencia(this.nombre, this.descripcion).then(() => {
      console.log('Incidencia enviada con éxito');
      this.mostrarAlerta("Incidencia enviada con éxito");
      this.nombre = '';
      this.descripcion = '';
    }).catch(error => {
      // Manejo de errores
      console.error('Error al enviar la incidencia', error);
      this.mostrarAlerta("Error al enviar la incidencia");
    });
  }

  mostrarAlerta(cadena:string) {
    alert(cadena);
    setTimeout(function() {
        // Cierra la alerta
        window.close();
    }, 3000); // 3000 milisegundos = 3 segundos
  }
  */
}
