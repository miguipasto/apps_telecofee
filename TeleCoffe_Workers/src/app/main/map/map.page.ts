import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Map, marker, tileLayer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
  reponer: string[] = [];


  constructor(private mqttService: MqttService) { }

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
  }

  ngAfterViewInit(){
        
  }

  configurarRuta(){

    console.log("Configurando ruta...")
    const map= new Map('map').setView([42.16926,-8.68377], 15.4);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    marker([42.16876,-8.68843]).addTo(map).bindPopup("<b>Minas</b><br>").openPopup();
    marker([42.16785,-8.68943]).addTo(map).bindPopup("<b>Industriales</b><br>").openPopup();
    marker([42.16719,-8.68528]).addTo(map).bindPopup("<b>Biología</b><br>").openPopup();
    marker([42.16979,-8.68809]).addTo(map).bindPopup("<b>Teleco</b><br>").openPopup();
 

    const waypoints = [];

    // Verificar si la máquina teleco tiene algún producto con valor 1
    if (Object.values(this.nivelesActualizar["Telecomunicación"]).includes(1)) {
      console.log("Teleco tiene que reponerse")
      waypoints.push(L.latLng(42.16979,-8.68809)); // Coordenadas para Teleco
    }

    // Verificar si la máquina minas tiene algún producto con valor 1
    if (Object.values(this.nivelesActualizar["Minas"]).includes(1)) {
      console.log("Minas tiene que reponerse")
      waypoints.push(L.latLng(42.16876,-8.68843)); // Coordenadas para Minas
    }
    // Verificar si la máquina teleco tiene algún producto con valor 1
    if (Object.values(this.nivelesActualizar["Industriales"]).includes(1)) {
      console.log("Industriales tiene que reponerse")
      waypoints.push(L.latLng(42.16785,-8.68943)); // Coordenadas para Teleco
    }

    // Verificar si la máquina minas tiene algún producto con valor 1
    if (Object.values(this.nivelesActualizar["Biología"]).includes(1)) {
      console.log("Biología tiene que reponerse")
      waypoints.push(L.latLng(42.16719,-8.68528)); // Coordenadas para Minas
    }
    console.log(waypoints)
    // Agregar la ruta solo si hay al menos dos waypoints
    if (waypoints.length >= 2) {
      L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        show: false
      }).addTo(map);
    }
  

    alert("Se ha creado una ruta para repooner:\n" + this.reponer)
}
  

subscribeToTopics() {
  this.isConnection = true;
  var respuestasRecibidas=0;

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

    // Intenta desuscribirte del tópico anterior si ya estás suscrito
    if (this.subscriptions[nombre]) {
      this.subscriptions[nombre].unsubscribe();
      console.log(`Desuscripto del tópico anterior de ${nombre}.`);
    }

    // Intenta suscribirte al nuevo tópico
    this.subscriptions[nombre] = this.mqttService.observe(topic).subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        this.lastLineLevels = message.payload.toString();
        console.log(message.payload.toString());// Convertir el mensaje recibido a un objeto JavaScript
        let data = JSON.parse(message.payload.toString());
      
        console.log("Actualizado")

        // Aquí puedes realizar tus acciones en función de los datos recibidos
        // Por ejemplo, puedes agregar lógica para verificar los niveles de agua, café, etc.

        if(data.niveles.nivel_agua_pr < 30) {
          console.log(`${nombre} tiene que reponer agua`);
          this.nivelesActualizar[nombre]["agua"] = 1;
          this.reponer.push(nombre+ " - Agua \n")
        }
        if(data.niveles.nivel_cafe_pr < 30) {
          console.log(`${nombre} tiene que reponer café`);
          this.nivelesActualizar[nombre]["café"] = 1;
          this.reponer.push(nombre+ " - Café\n")
        }
        if(data.niveles.nivel_leche_pr < 30) {
          console.log(`${nombre} tiene que reponer leche`);
          this.nivelesActualizar[nombre]["leche"] = 1;
          this.reponer.push(nombre+ " - leche\n")
        }
        if(data.niveles.patatillas_u < 3) {
          console.log(`${nombre} tiene que reponer patatas`);
          this.nivelesActualizar[nombre]["patatas"] = 1;
          this.reponer.push(nombre+ " - Patatillas\n")
        }

         // Incrementar el contador de respuestas recibidas
         respuestasRecibidas++;

         // Verificar si se han recibido las cuatro respuestas
         if (respuestasRecibidas === 4) {
           // Llamar a la función para configurar la ruta
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




}
