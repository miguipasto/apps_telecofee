//import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import * as apex from "ng-apexcharts";
import { HttpClient} from '@angular/common/http';
import {ApexXAxis } from 'ng-apexcharts';

import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

   
  
@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.page.html',
  styleUrls: ['./elementos.page.scss'],
})
export class ElementosPage implements OnInit{

  isOverlayVisible: boolean = false;
  isOverlayCompra: boolean =false;
  codigoConfirmacion : number = 0;
  amountToAdd!: number | null;
  productoSeleccionado: string = "";
  nombre: string = ""; // Cambiado a string

  series!: apex.ApexAxisChartSeries;
  chart!: apex.ApexChart;
  title!: apex.ApexTitleSubtitle;
  
  datos: any[] = [];
  datos_fecha: String[]=[]
  datos_porcentaje: number[]=[]
  datos_color: String[]=[]

  private subscription: Subscription | undefined;
  public receiveNews = '';
  public lastLineLevels = "";
  public isConnection = false;
  

  constructor(private route: ActivatedRoute, private router:Router, private http: HttpClient, private mqttService: MqttService, private dataService: DataService) { 
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.nombre = params.get('nombre') || ''; // Obtener el valor del parámetro 'nombre' y asignarlo a nombre
    });
    this.subscribeToTopic(this.nombre);
  }

  private crearGrafica(): void{

    this.datos_fecha=[];
    this.datos_porcentaje=[];
    this.datos_color=[];
    this.datos=[];
    
    console.log("Cambios")
    this.http.get<any>('assets/datos.JSON').subscribe(data => {
      console.log(data);
      data.datos.forEach((dato: { fecha: string; porcentaje: number; }) => {
        this.datos_fecha.push(dato.fecha);
        this.datos_porcentaje.push(dato.porcentaje);
        if(dato.porcentaje<10){
          this.datos_color.push('#ff0000')

        }else{
          console.log(this.selectedCategory)
          if(this.selectedCategory=="agua") this.datos_color.push("#A3CCFD");
          else if(this.selectedCategory=="cafe") this.datos_color.push('#70442b');
          else if(this.selectedCategory=="leche") this.datos_color.push("#E9DBAB");
          else this.datos_color.push("#ff0000");

        }
      });

    for (let i = 0; i < this.datos_fecha.length; i++) {
      this.datos.push({
        x: this.datos_fecha[i],
        y: this.datos_porcentaje[i],
        fillColor: this.datos_color[i]
      
      });
    } 
  });

    this.initializeChartOption();
  }
  
  private initializeChartOption(): void {
    this.title = {
      text: 'Nivel de ' + this.selectedCategory
    };
  
    this.series = [{
      name: 'Porcentaje',
      data: this.datos , 
      //color: this.datos_color
    }];
  
    this.chart = {
      type: 'bar',
    };


  }
  

  showOverlay(nombre: string) {
    this.isOverlayVisible = true;
    this.productoSeleccionado = nombre;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
    this.isOverlayCompra = false;
    this.amountToAdd = null; 
  }

  selectedCategory: string = 'consumos'; // Valor inicial para mostrar algo al inicio
  product: any = {
    consumos: [
      { name: 'Agua', porcentaje:0},
      { name: 'Café',porcentaje:0},
      { name: 'Leche',porcentaje:0},
      { name: 'Patatillas',porcentaje:0}
    ],
    agua: [
    ],
    cafe: [
    ],
    leche: [
    ],
    patatillas: [
    ],
    ventas: [
    ]    
  };

  selectCategory(category: string) {
    this.selectedCategory = category;

     // Llama a la función de inicialización del gráfico si la categoría seleccionada es diferente de 'consumos'
  if (this.selectedCategory !== 'consumos') {
    this.crearGrafica();
  }
  }

  obtenerColorPorcentaje(porcentaje:number): string {
      if (porcentaje >= 0 && porcentaje <= 10) {
           return "red";
      } else if (porcentaje > 10 && porcentaje <= 50) {
           return "orange";
      } else if (porcentaje > 50 && porcentaje < 90) {
           return "gray";
      } else if (porcentaje >= 90) {
           return "green";
      } else {
           return "negro"; // En caso de que el porcentaje no esté en ninguno de los rangos especificados
      };
  }

  obtenerColorTanque(nombre:string): string {
          if (nombre==("Agua")) {
            return "#A3CCFD";
        }else if (nombre==("Café")) {
            return "#70442b";
        } else if (nombre==("Leche")) {
            return "#E9DBAB";
        } else {
            return "negro"; // En caso de que el porcentaje no esté en ninguno de los rangos especificados
        }
  }

  redirigir_maquinas(){
    this.router.navigate(['/main/main/home']);
  }

  
  actualizarPorcentaje(categoria: string, indice: number, nuevoPorcentaje: number) {
    if (categoria === 'consumos' || categoria === 'estadisticas') {
      this.product[categoria][indice].porcentaje = nuevoPorcentaje;
    } else {
      console.error('Categoría no válida');
    }
  }
  

  addBalance(nombre:string) {
    let data = JSON.parse(this.lastLineLevels);
    if(this.amountToAdd!=null){
    if(nombre=='Patatillas') {
      this.product["consumos"][3].porcentaje += (this.amountToAdd);
    }else if(nombre=='Café'){
      this.product["consumos"][1].porcentaje += Math.floor((this.amountToAdd*100)/100);
        data.niveles.nivel_cafe_pr += Math.floor((this.amountToAdd*100)/100);
        data.niveles.nivel_cafe_gr += this.amountToAdd;
    }else{
      if(nombre=='Agua'){
        this.product["consumos"][0].porcentaje += Math.floor((this.amountToAdd*100)/200);
        data.niveles.nivel_agua_pr += Math.floor((this.amountToAdd*100)/200)
        data.niveles.nivel_agua_ml += this.amountToAdd;
      } 
      if(nombre=='Leche'){
          this.product["consumos"][2].porcentaje += Math.floor((this.amountToAdd*100)/200);
          data.niveles.nivel_leche_pr += Math.floor((this.amountToAdd*100)/200)
          data.niveles.nivel_leche_ml += this.amountToAdd;
      } 
    
    }

    this.dataService.actualizarNiveles(data,this.nombre)   
    alert("Producto actualizado") 
    console.log("Actualizando producto:", this.amountToAdd);
    this.closeOverlay();
  }
  }

  validateAmount(event: Event) {
    var value = +(<HTMLInputElement>event.target).value;
    if(this.productoSeleccionado=="Patatillas"){

      if (isNaN(value) || value < 0) {
        this.amountToAdd = 0;
      }else if (value > 10) {
        this.amountToAdd = 10;
      } else {
        this.amountToAdd = Math.floor(value);
      }
    }else if(this.productoSeleccionado=="cafe"){
      if (isNaN(value) || value < 0) {
        this.amountToAdd = 0;
      }else if (value > 100) {
        this.amountToAdd = 100;
      } else {
        this.amountToAdd = value;
      }
    }else{
      if (isNaN(value) || value < 0) {
        this.amountToAdd = 0;
      }else if (value > 200) {
        this.amountToAdd = 200;
      } else {
        this.amountToAdd = value;
      }
    }
    
  }

  subscribeToTopic(maquina : String) {
    this.isConnection = true;
    const nombre=this.nombre.toLocaleLowerCase();
    const topic = `${nombre}/nivel`;

    // Primero, verifica si ya hay una suscripción y desuscríbete
    if (this.subscription) {
      this.subscription.unsubscribe();
      console.log('Desuscripto del tópico anterior.');
    }

    console.log(topic)
    // Intentamos suscribirnos al tópico
    this.subscription = this.mqttService.observe(topic).subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        this.lastLineLevels = message.payload.toString();
        console.log(message.payload.toString());// Convertir el mensaje recibido a un objeto JavaScript
        let data = JSON.parse(message.payload.toString());
        
    
        // Actualizar los porcentajes en this.product["consumo"][0]
        this.product["consumos"][0].porcentaje = data.niveles.nivel_agua_pr;
        this.product["consumos"][1].porcentaje = data.niveles.nivel_cafe_pr;
        this.product["consumos"][2].porcentaje = data.niveles.nivel_leche_pr;
        this.product["consumos"][3].porcentaje = data.niveles.patatillas_u;

      },
      error: (error: any) => {
        this.isConnection = false;
        console.error(`Connection error: ${error}`);
      }
    });
  }



}


