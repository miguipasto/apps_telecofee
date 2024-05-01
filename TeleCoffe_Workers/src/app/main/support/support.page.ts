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
  datosIncidencia: { descripcion: string; fecha: any; maquina: string; email: string; enviado: boolean }[] = [];
  nombresFormales: { [maquina: string]: string } = {
    teleco: "Escuela de Ingienería de Telecomunicación",
    minas: "Escuela de Ingeniería de Minas y Energía",
    industriales: "Escuela de Ingienería Industrial",
    biologia: "Facultad de Biología"
  };


  constructor(private backend: BackendSocketsService) {}

  ngOnInit() {
    this.obtenerIncidencias();
  }

  convertirFecha(fechaFirestore: { _seconds: number; _nanoseconds: number }): Date {
    return new Date(fechaFirestore._seconds * 1000);
  }
  
  async obtenerIncidencias() {
    let incidencias = await this.backend.obtenerIncidencias();
    incidencias = incidencias.filter(incidencia => !incidencia.enviado);
  
    this.datosIncidencia = incidencias.map(incidencia => ({
      ...incidencia,
      fecha: this.convertirFecha(incidencia.fecha),
      maquina: this.obtenerNombreFormalMaquina(incidencia.maquina)
    }));
  
    // Ordenando las incidencias por fecha
    this.datosIncidencia.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  
    // Opcionalmente, convertir fecha de Date a String si necesitas mostrarla así
    this.datosIncidencia = this.datosIncidencia.map(incidencia => ({
      ...incidencia,
      fecha: incidencia.fecha.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    }));
  
    console.log(this.datosIncidencia);
  }
  

  obtenerNombreFormalMaquina(nombreOriginal: string): string {
    return this.nombresFormales[nombreOriginal] || nombreOriginal;
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
