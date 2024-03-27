//import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import * as apex from "ng-apexcharts";
import { HttpClient} from '@angular/common/http';
import {ApexXAxis } from 'ng-apexcharts';

import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { BackendSocketsService } from 'src/app/services/BackEndSocketService';

   
  
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
  datos_precio: number[]=[]
  datos_porcentaje: number[]=[]
  datos_color: String[]=[]
  fecha_grafica!: Date;

  datosVentas: { precio: string; fecha: any; maquina: string, producto: string;}[]=[];

  private subscription: Subscription | undefined;
  public receiveNews = '';
  public lastLineLevels = "";
  public isConnection = false;
  public productos: String[] = [ "Café con leche",  "Cafe americano", "Leche", "Patatillas"]

  

  constructor(private route: ActivatedRoute, private router:Router, private http: HttpClient, private mqttService: MqttService, private dataService: DataService, private backendService: BackendSocketsService) { 
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.nombre = params.get('nombre') || ''; // Obtener el valor del parámetro 'nombre' y asignarlo a nombre
    });
    this.subscribeToTopic(this.nombre);
  }

  private async crearGrafica(): Promise<void>{

    this.datos_fecha=[];
    this.datos_precio = Array(4).fill(0);
    this.datos_color=[];
    this.datos=[];
    this.datos_porcentaje=[];
    
    console.log("Cambios")
    if(this.selectedCategory=="ventas"){

       let ventas= await this.backendService.obtenerVentas(this.nombre,this.fecha_grafica)

       console.log(ventas)

    for (let i = 0; i < ventas.length; i++) {
      const dato = ventas[i];
      console.log(dato)
      if(dato.producto==this.productos[0]){//café con leche
        console.log(this.datos_precio[0])

        this.datos_precio[0]+=parseFloat(dato.precio)// Agregar el precio (convertido a número)
        this.datos_color[0]= "#ffbf75"// Generar un color aleatorio

      }else if(dato.producto==this.productos[1]){//cafe americano

        this.datos_precio[1]+=parseFloat(dato.precio) // Agregar el precio (convertido a número)
        this.datos_color[1]= "#ffbf75"// Generar un color aleatorio

      }else if(dato.producto==this.productos[2]){//leche

        this.datos_precio[2]+=parseFloat(dato.precio) // Agregar el precio (convertido a número)
        this.datos_color[2]= "#75cdff"// Generar un color aleatorio

      }else{ //patatillas

        this.datos_precio[3]+=parseFloat(dato.precio) // Agregar el precio (convertido a número)
        this.datos_color[3]= "#b275ff"// Generar un color aleatorio

      }
     
    }

    for (let i = 0; i < this.datos_fecha.length; i++) {
      this.datos.push({
        x: this.productos[i],
        y: this.datos_precio[i],
        fillColor: this.datos_color[i]
      
      });
    } 

    }else{

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
  }

    this.initializeChartOption();
  }
  
  private initializeChartOption(): void {
    this.title = {
      text: 'Nivel de ' + this.selectedCategory
    };
  
    this.series = [{
      name: 'Procentaje',
      data: this.datos
      //color: this.datos_color
    }];
  
    this.chart = {
      type: 'bar',
      background: '#f8f1d8'
     
    };


  }

  private initializeChartOptionVentas(): void {
    this.title = {
      text: 'Nivel de ' + this.selectedCategory
    };
  
    this.series = [{
      name: 'Porcentaje',
      data: this.datos
      //color: this.datos_color
    }];
  
    this.chart = {
      type: 'bar',
      background: '#f8f1d8'
     
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

  convertirFecha(fechaFirestore: { _seconds: number; _nanoseconds: number }): string {
    const fecha = new Date(fechaFirestore._seconds * 1000);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }



}


