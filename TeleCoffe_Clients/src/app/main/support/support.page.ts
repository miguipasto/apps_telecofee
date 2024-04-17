import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {

  maquinaSeleccionada: String = "";

  constructor(private dataService: DataService, public alertController: AlertController) { }

  ngOnInit() {
  }

  nombre = '';
  descripcion = '';

  enviar_incidencia() {
    this.dataService.crearIncidencia(this.nombre, this.descripcion, this.maquinaSeleccionada).then(() => {
      console.log('Incidencia enviada con éxito');
      this.presentAlert("Incidencia enviada con éxito", "Se ha registrado su mensaje correctamente, pronto recibirá respuesta.")
      this.nombre = '';
      this.descripcion = '';
      this.maquinaSeleccionada = '';
    }).catch(error => {
      console.error('Error al enviar la incidencia', error);
      this.presentAlert("Error", "No se ha podido enviar la incidencia, por favor, inténtelo de nuevo.")
      alert('Error al enviar la incidencia');
    });
  }

  async presentAlert(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
