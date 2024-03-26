import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';
import { BackendSocketsService } from 'src/app/services/BackEndSocketService';

@Component({
 selector: 'app-support',
 templateUrl: './support.page.html',
 styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {
  @ViewChild('respuestaInput') respuestaInput!: ElementRef;

  isOverlayVisible: boolean = false;
  descripcionActual: string = "";
  emailActual: string = "";
  index :  number=0;
  datosIncidencia: { descripcion: string; fecha: string; maquina: string; email: string; enviado: boolean }[] = [];

  constructor(private backend: BackendSocketsService) {}

  ngOnInit() {
    this.obtenerIncidencias();
  }

  async obtenerIncidencias() {
    this.datosIncidencia = await this.backend.obtenerIncidencias();
    // Filtrar las incidencias para excluir las que ya tienen correos electrónicos enviados
    this.datosIncidencia = this.datosIncidencia.filter(incidencia => !incidencia.enviado);
  }

  showOverlay(descripcion: string, email: string,index:number) {
    this.isOverlayVisible = true;
    this.index = index;
    this.descripcionActual = descripcion;
    this.emailActual = email;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
  }

  public sendEmail(e: Event) {
    const respuesta = this.respuestaInput.nativeElement.value;

    e.preventDefault();

    emailjs
      .send("service_whwvqfp", "template_dxht4wo", { message: respuesta, email_id: this.emailActual }, "5Tn6zncCzU7D7Sp9S")
      .then(
        () => {
          console.log('Correo electrónico enviado con éxito!');
          // Marcar la incidencia como enviada
          const incidenciaIndex = this.datosIncidencia.findIndex(incidencia => incidencia.email === this.emailActual);
          if (incidenciaIndex !== -1) {
            this.datosIncidencia[incidenciaIndex].enviado = true;
          }
        },
        (error) => {
          console.error('Error al enviar el correo electrónico:', error);
        }
      );

    this.respuestaInput.nativeElement.value = '';
    this.datosIncidencia[this.index].enviado=true;
    this.closeOverlay();
  }
}
