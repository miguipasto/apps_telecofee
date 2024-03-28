import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Map, marker, tileLayer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit(){
    const map= new Map('map').setView([42.16926,-8.68377], 15.4);
    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    marker([42.16854,-8.68838]).addTo(map).bindPopup("<b>Minas</b><br>").openPopup();
    marker([42.16785,-8.68943]).addTo(map).bindPopup("<b>Industriales</b><br>").openPopup();
    marker([42.16719,-8.68528]).addTo(map).bindPopup("<b>Biología</b><br>").openPopup();
    marker([42.16979,-8.68809]).addTo(map).bindPopup("<b>Teleco</b><br>").openPopup();

    /*
     // Configurar la ruta
     L.Routing.control({
      waypoints: [
        L.latLng(42.16854, -8.68838), // Coordenadas para Minas
        L.latLng(42.16979,-8.68809)  // Coordenadas para Teleco
      ],
      routeWhileDragging: true, // Permitir mostrar la ruta mientras se arrastra el marcador
      show: false // No mostrar las instrucciones de navegación
    }).addTo(map);
    
    */
  }

}
