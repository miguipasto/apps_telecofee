//import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';

import * as apex from "ng-apexcharts";
import { HttpClient} from '@angular/common/http';

import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { BackendSocketsService } from 'src/app/services/BackEndSocketService';


interface GraficaDataBarras {
  name: string;
  value: number;
}

interface Niveles {
  patatillas_pr: number;
  patatillas_u: number;
  nivel_agua_pr: number;
  nivel_leche_pr: number;
  nivel_cafe_pr: number;
  nivel_agua_ml: number;
  nivel_leche_ml: number;
  nivel_cafe_gr: number;
}

interface EstadoMaquina {
  [maquina: string]: Niveles;
}

interface GraficaNiveles {
  [nombreMaquina: string]: {
    data: GraficaDataBarras[];
    viewSize: [number,number];
    xAxisLabel: string;
    yAxisLabel: string;
    showXAxisLabel: boolean;
    showYAxisLabel: boolean;
    xAxis: boolean;
    yAxis: boolean;
    yScaleMax: number;
    gradient: boolean;
    legend: boolean;
    showGridLines: boolean;
  };
}
 
@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.page.html',
  styleUrls: ['./elementos.page.scss'],
})
export class ElementosPage implements OnInit, AfterViewInit{

  productos = ["agua",  "cafe", "leche", "patatillas"]
  nombresFormales: { [key: string]: string } = {
    agua: "Escuela de Ingienería de Telecomunicación",
    cafe: "Escuela de Ingeniería de Minas y Energía",
    leche: "Escuela de Ingienería Industrial",
    patatillas: "Facultad de Biología"
  };
  estadoMaquinas: EstadoMaquina = {};

  graficasNiveles: GraficaNiveles = {};
  viewSizeNivel: [number, number] = [0, 0];
  mostrarGraficasNivel: boolean = false;

  isOverlayVisible: boolean = false;
  isOverlayCompra: boolean =false;
  codigoConfirmacion : number = 0;
  amountToAdd!: number | null;
  productoSeleccionado: string = "";
  nombre: string = ""; // Cambiado a string


  private subscription: Subscription | undefined;
  public receiveNews = '';
  public lastLineLevels = "";
  public isConnection = false;
  //public productos: String[] = [ "Café con leche",  "Cafe americano", "Leche", "Patatillas"]


  constructor(private route: ActivatedRoute, private router:Router, private http: HttpClient, private mqttService: MqttService, private dataService: DataService, private backendService: BackendSocketsService) { 
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const nombre = params.get('nombre');
      if (nombre) {
        this.nombre = nombre;
        this.subscribeToTopic(this.nombre);
        this.inicializarGraficasNiveles();
      }
    });
   
   
  }

  ngAfterViewInit() {
    this.adjustGraphSize();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

 adjustGraphSize() {
    const width = window.innerWidth - 50; // Ancho de la pantalla menos el espacio de margen
    const height = 300; // Altura deseada

    // No es necesario calcular las coordenadas x e y ya que el contenedor está centrado en CSS

    // Establece la vista con el ancho y la altura calculados
    this.viewSizeNivel = [width, height];
    this.inicializarGraficasNiveles();
}


  inicializarGraficasNiveles() {
    this.productos.forEach(producto => {
      const nombreFormal = this.nombresFormales[producto];  
      this.graficasNiveles[producto] = {
        data: [],
        viewSize: this.viewSizeNivel,
        xAxisLabel: nombreFormal,
        yAxisLabel: 'Porcentaje',
        showXAxisLabel: true,
        showYAxisLabel: true,
        xAxis: true,
        yAxis: true,
        yScaleMax: 100,
        gradient: false,
        legend: false,
        showGridLines: false,
      };
    });
  }


  obtenerCompras(nombre_maquina: string, fecha: string) {
    this.backendService.compras(nombre_maquina, fecha).subscribe({
      next: (compras) => {
        // Procesar las compras para agruparlas por máquina y fecha
        this.procesarCompras(compras);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
  
  procesarCompras(compras: any[]){
    const ventas: { [maquina: string]: { [fecha: string]: number } } = {};
    const ventasPorProducto: { [producto: string]: number } = {};
    
    compras.forEach(compra => {
      const fecha = new Date(compra.fecha._seconds * 1000).toISOString().split('T')[0];
      const maquina = compra.maquina;
      const producto = compra.producto;
      
      if (!ventas[maquina]) {
        ventas[maquina] = {};
      }
      if (!ventas[maquina][fecha]) {
        ventas[maquina][fecha] = 0;
      }
  
      ventas[maquina][fecha] += 1;
  
      // Conteo de ventas por producto
      if (!ventasPorProducto[producto]) {
        ventasPorProducto[producto] = 0;
      }
      ventasPorProducto[producto] += 1;
    });
  
  }

  procesarDatos(datos: any[]){
    
    datos.forEach(data => {
      const fecha = new Date(data.fecha._seconds * 1000).toISOString().split('T')[0];
      const nivel_agua = data.niveles.nivel_agua_pr;
      const nivel_cafe = data.niveles.nivel_cafe_pr;
      const nivel_leche = data.niveles.nivel_leche_pr;
      const nivel_patatillas = data.niveles.patatillas_u;

      console.log(nivel_patatillas)

    // Actualizar los datos de las gráficas correspondientes
    this.graficasNiveles['agua'].data.push({ name: fecha, value: nivel_agua });
    this.graficasNiveles['cafe'].data.push({ name: fecha, value: nivel_cafe });
    this.graficasNiveles['leche'].data.push({ name: fecha, value: nivel_leche });
    this.graficasNiveles['patatillas'].data.push({ name: fecha, value: nivel_patatillas });

    });
    
  }

  actualizarEstadoMaquina() {
    try {

      this.backendService.ObtenerDatos(this.nombre.toLocaleLowerCase(), "2024-03-25").subscribe({
        next: (response) => {
          if (response.success) {
            const data = response.data;
            console.log("Datos:", data);
            // Procesar los datos aquí
            this.procesarDatos(data);
          } else {
            console.error("Error en la respuesta:", response.message);
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
     
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
    

   
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
    //this.crearGrafica();
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
        data.niveles.patatillas_pr += Math.floor((this.amountToAdd*100)/10);
        data.niveles.patatillas_u += this.amountToAdd;
      } else if(nombre=='Café') {
        this.product["consumos"][1].porcentaje += Math.floor((this.amountToAdd*100)/100);
          data.niveles.nivel_cafe_pr += Math.floor((this.amountToAdd*100)/100);
          data.niveles.nivel_cafe_gr += this.amountToAdd;
      } else {
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
      console.log("El producto actualizado", data)
      // Actualizamos en Firebase
      this.dataService.actualizarNiveles(data,this.nombre)   
      // Avisamos por MQTT
      this.nuevaReposicon(data['maquina']);

      alert("Producto actualizado") 
      console.log("Actualizando producto:", this.amountToAdd);
      this.closeOverlay();
    }
  }

  nuevaReposicon(maquina : String){
    this.mqttService.publish(`reposicion`, `${maquina}`).subscribe({
      next: () => console.log(`Nueva repisicion ${maquina}`),
      error: (error: any) => {
          console.error("Error al publicar mensaje:", error);
      }
    }); 
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

        console.log("Actualizado")

        this.actualizarEstadoMaquina()

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

