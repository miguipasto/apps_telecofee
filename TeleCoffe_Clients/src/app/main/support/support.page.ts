import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {

  maquinaSeleccionada: String = "";

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

  nombre = '';
  descripcion = '';

  enviar_incidencia() {
    this.dataService.crearIncidencia(this.nombre, this.descripcion, this.maquinaSeleccionada).then(() => {
      console.log('Incidencia enviada con éxito');
      alert('Incidencia enviada con éxito');
      this.nombre = '';
      this.descripcion = '';
      this.maquinaSeleccionada = '';
    }).catch(error => {
      // Manejo de errores
      console.error('Error al enviar la incidencia', error);
      alert('Error al enviar la incidencia');      alert('E');

    });
  }

}
