import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Map, marker, tileLayer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { MqttPrototipoService } from 'src/app/services/mqtt-prototipo.service';
import { MqttServerService } from 'src/app/services/mqtt-server.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
  reponer: string[] = [];
  mapIsVisible: boolean = false;
  mqttClient: any;

  constructor(
    private mqttPrototipoService: MqttPrototipoService,
    private mqttServerService: MqttServerService,
    public alertController: AlertController) { }

  subscriptions: { [nombreMaquina: string]: Subscription } = {};
  public receiveNews = '';
  public lastLineLevels = "";
  public isConnection = false;



  nivelesActualizar: { [nombre: string]: { [producto: string]: number } } = {
    "Telecomunicación": {
      "agua": 0,
      "café": 0,
      "leche": 0,
      "patatas": 0
    },
    "Minas": {
      "agua": 0,
      "café": 0,
      "leche": 0,
      "patatas": 0
    },
    "Industriales": {
      "agua": 0,
      "café": 0,
      "leche": 0,
      "patatas": 0
    },
    "Biología": {
      "agua": 0,
      "café": 0,
      "leche": 0,
      "patatas": 0
    },
  };

  ngOnInit() {
    this.subscribeToTopics();
    this.mapIsVisible = false;
  }

  ngAfterViewInit() {

  }

  async presentAlert(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async configurarRuta() {
    console.log("Configurando ruta...");
    const map = new Map('map').setView([42.16926, -8.68377], 15.4);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    let waypoints: any[] = [];
    waypoints = await this.addCurrentLocationMarker(map, waypoints);
  
    const maquinas = [
      { nombre: "Telecomunicación", coords: [42.16979, -8.68809] as [number, number] },
      { nombre: "Minas", coords: [42.16876, -8.68843] as [number, number] },
      { nombre: "Industriales", coords: [42.16785, -8.68943] as [number, number] },
      { nombre: "Biología", coords: [42.16719, -8.68528] as [number, number] },
    ];
    
    maquinas.forEach(maquina => {
      if (Object.values(this.nivelesActualizar[maquina.nombre]).includes(1)) {
        console.log(`${maquina.nombre} tiene que reponerse`);
        marker(maquina.coords).addTo(map).bindPopup(`<b>${maquina.nombre}</b><br>`).openPopup();
        waypoints.push(L.latLng(...maquina.coords));
      }
    });
    
  
    console.log(waypoints);
    // Agregar la ruta solo si hay al menos dos waypoints
    if (waypoints.length >= 2) {
      L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        show: true
      }).addTo(map);
    }
  
    alert("Se ha creado una ruta para reponer:\n" + this.reponer.join(''));
    //this.presentAlert("Nueva ruta de reposición", this.reponer.join('\n'))
    this.reponer = [];
  }
  

  subscribeToTopics() {
    this.isConnection = true;
    var respuestasRecibidas = {"minas": 0, "industriales": 0, "teleco": 0, "biologia": 0}

    // Definir los nombres de las máquinas y sus respectivos tópicos
    const maquinasYTopics = [
      { nombre: "Telecomunicación", topic: "teleco/nivel" },
      { nombre: "Minas", topic: "minas/nivel" },
      { nombre: "Biología", topic: "biologia/nivel" },
      { nombre: "Industriales", topic: "industriales/nivel" }
    ];

    // Suscribirse a los tópicos
    maquinasYTopics.forEach(maquinaYTopic => {
      const { nombre, topic } = maquinaYTopic;

      if (nombre === "Telecomunicación") {
        this.mqttClient = this.mqttServerService;
      } else {
        this.mqttClient = this.mqttServerService;
      }

      // Intenta desuscribirte del tópico anterior si ya estás suscrito
      if (this.subscriptions[nombre]) {
        this.subscriptions[nombre].unsubscribe();
      }

      // Intenta suscribirte al nuevo tópico
      this.subscriptions[nombre] = this.mqttClient.observe(topic).subscribe({
        next: (message: IMqttMessage) => {
          this.receiveNews += message.payload.toString() + '\n';
          let data = JSON.parse(message.payload.toString());
          //console.log(data)

          if (data.niveles.nivel_agua_pr < 30) {
            console.log(`${nombre} tiene que reponer agua`);
            this.nivelesActualizar[nombre]["agua"] = 1;
            this.reponer.push(nombre + " - Agua \n")
          }
          if (data.niveles.nivel_cafe_pr < 30) {
            console.log(`${nombre} tiene que reponer café`);
            this.nivelesActualizar[nombre]["café"] = 1;
            this.reponer.push(nombre + " - Café\n")
          }
          if (data.niveles.nivel_leche_pr < 30) {
            console.log(`${nombre} tiene que reponer leche`);
            this.nivelesActualizar[nombre]["leche"] = 1;
            this.reponer.push(nombre + " - leche\n")
          }
          if (data.niveles.patatillas_u < 3) {
            console.log(`${nombre} tiene que reponer patatas`);
            this.nivelesActualizar[nombre]["patatas"] = 1;
            this.reponer.push(nombre + " - Patatillas\n")
          }

          // Incrementar el contador de respuestas recibidas
          respuestasRecibidas[data.maquina as keyof typeof respuestasRecibidas]++;
          //console.log(respuestasRecibidas)

          // Verificar si se han recibido las cuatro respuestas
          if (Object.values(respuestasRecibidas).every(count => count > 0)) {
            this.mapIsVisible = true;
            this.configurarRuta();
          }
        },
        error: (error: any) => {
          this.isConnection = false;
          console.error(`Error de conexión para ${nombre}: ${error}`);
        }
      });
    });

  }
  async addCurrentLocationMarker(map: any, waypoints: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        L.marker([lat, lon])
          .addTo(map)
          .bindPopup('¡Estás aquí!')
          .openPopup();

        waypoints.push(L.latLng(lat, lon));

        resolve(waypoints); // Resolver la promesa con los waypoints actualizados
      }, (error) => {
        console.error('Error obteniendo la ubicación: ', error);
        resolve(waypoints); // Resolver la promesa con los waypoints existentes si hay un error
      });
    });
  }
}
