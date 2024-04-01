//import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
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
    showLabels: boolean;
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
  selectedDate: string = '';

  productos = ["agua",  "cafe", "leche", "patatillas","ventas"]
  nombresFormales: { [key: string]: string } = {
    agua: "Nivel de Agua",
    cafe: "Nivel de Café",
    leche: "Nivel de leche",
    patatillas: "Nivel de patatillas"
  };

  ventas = ["Patatillas",  "Café con leche", "Café americano", "Leche"]
  costesProductos: { [key: string]: number } = {
    "Patatillas": 0.85,
    "Café con leche": 1.35,
    "Café americano": 1.15,
    "Leche": 0.50
};


  nombresMaquinas: { [key: string]: string } = {
    Telecomunicación: "teleco",
    Minas: "minas",
    Industriales: "industriales",
    Biología: "biologia"
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


  constructor(private route: ActivatedRoute, private router:Router, private mqttService: MqttService, private dataService: DataService, private backendService: BackendSocketsService) { 
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const nombre = params.get('nombre');
      if (nombre) {
        this.nombre = nombre;
        this.subscribeToTopic(this.nombresMaquinas[this.nombre]);
        this.inicializarGraficasNiveles();
        this.initializeDates();
        this.initializeSelectedDate();
        this.updateChart();
      }
    });
   
  }

  ngAfterViewInit() {
    this.adjustGraphSize();
    this.actualizarEstadoMaquina()
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

 adjustGraphSize() {
    const width = window.innerWidth - 50; // Ancho de la pantalla menos el espacio de margen
    const height = 370; // Altura deseada

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
        yAxisLabel: 'Porcentaje (%)',
        showXAxisLabel: true,
        showYAxisLabel: true,
        showLabels:true,
        xAxis: true,
        yAxis: true,
        yScaleMax: 100,
        gradient: false,
        legend: false,
        showGridLines: false,
      };
    });
  }

  procesarVentas(compras: any[]) {
    console.log("procesar ventas:", compras);
    const ventasPorProducto: { [producto: string]: number } = {};

     // Reinicializar el array de datos antes de procesar las ventas
     this.graficasNiveles["ventas"].data = [];

    // Inicializar las ventas por producto a 0
    Object.keys(this.costesProductos).forEach(producto => {
        ventasPorProducto[producto] = 0;
    });

    // Conteo de ventas por producto y cálculo del coste total
    let costeMaximo = 0;
    compras.forEach(compra => {
        const producto = compra.producto;
        ventasPorProducto[producto] += 1; // Incrementar el contador de ventas por producto
    });

    // Construir los datos de la gráfica, incluyendo productos sin ventas
    Object.keys(this.costesProductos).forEach(producto => {
        const cantidadVentas = ventasPorProducto[producto] || 0; // Si no hay ventas, establece cantidad a 0
        const costeIndividual = this.costesProductos[producto];
        const costeTotal = cantidadVentas * costeIndividual;

        // Actualiza el coste máximo si el coste total actual es mayor
        if (costeTotal > costeMaximo) {
            costeMaximo = costeTotal;
        }

        // Actualizar los datos de las gráficas correspondientes
        this.graficasNiveles["ventas"].data.push({ name: producto, value: costeTotal });
    });

    // Actualiza las propiedades de la gráfica una vez procesadas todas las ventas
    this.graficasNiveles["ventas"].yAxisLabel = "Ganancias (€)";
    this.graficasNiveles["ventas"].yScaleMax = costeMaximo;
}



  procesarDatos(datos: any[]){
    
    datos.forEach(data => {
      const fecha = new Date(data.fecha._seconds * 1000).toISOString().split('T')[0];
      const nivel_agua = data.niveles.nivel_agua_pr;
      const nivel_cafe = data.niveles.nivel_cafe_pr;
      const nivel_leche = data.niveles.nivel_leche_pr;
      const nivel_patatillas = data.niveles.patatillas_pr;

    // Actualizar los datos de las gráficas correspondientes
    this.graficasNiveles['agua'].data.push({ name: fecha, value: nivel_agua });
    this.graficasNiveles['cafe'].data.push({ name: fecha, value: nivel_cafe });
    this.graficasNiveles['leche'].data.push({ name: fecha, value: nivel_leche });
    this.graficasNiveles['patatillas'].data.push({ name: fecha, value: nivel_patatillas });

    });
    
  }

  actualizarUltimaFecha(message: any) {
    let data = JSON.parse(message);
    const fecha = new Date().toISOString().split('T')[0];
    const nivel_agua = data.niveles.nivel_agua_pr;
    const nivel_cafe = data.niveles.nivel_cafe_pr;
    const nivel_leche = data.niveles.nivel_leche_pr;
    const nivel_patatillas = data.niveles.patatillas_pr;
  
    // Encuentra el índice del último elemento en el arreglo de datos para cada tipo de producto
    const indiceUltimaFecha = this.graficasNiveles['agua'].data.findIndex(dato => dato.name === fecha);
  
    // Si se encuentra la fecha en el arreglo de datos, actualiza su valor; de lo contrario, no hagas nada
    if (indiceUltimaFecha !== -1) {
      this.graficasNiveles['agua'].data[indiceUltimaFecha].value = nivel_agua;
      this.graficasNiveles['cafe'].data[indiceUltimaFecha].value = nivel_cafe;
      this.graficasNiveles['leche'].data[indiceUltimaFecha].value = nivel_leche;
      this.graficasNiveles['patatillas'].data[indiceUltimaFecha].value = nivel_patatillas;
    }
  }


  actualizarVentas() {
      this.backendService.ventas(this.nombresMaquinas[this.nombre], this.selectedDate).subscribe({
        next: (ventas) => {
          // Procesar las ventas para agruparlas por máquina y fecha
          console.log(ventas)
          this.procesarVentas(ventas);
        },
        error: (error) => {
          console.error(error);
        }
      });

   
  }

  sonNivelesIguales(niveles1: any, niveles2: any): boolean {
    console.log(niveles1, niveles2)
    return JSON.stringify(niveles1) === JSON.stringify(niveles2);
  }


  actualizarEstadoMaquina() {
    try {

      this.backendService.ObtenerDatos(this.nombresMaquinas[this.nombre]).subscribe({
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
        if(data.niveles.patatillas_u + this.amountToAdd >10){
          this.product["consumos"][3].porcentaje=10;
          data.niveles.patatillas_pr =100
          data.niveles.patatillas_u =10
        }else{
           this.product["consumos"][3].porcentaje += (this.amountToAdd);
            data.niveles.patatillas_pr += Math.floor((this.amountToAdd*100)/10);
            data.niveles.patatillas_u += this.amountToAdd;
        }
      } else if(nombre=='Café') {

          if(data.niveles.nivel_cafe_gr + this.amountToAdd >100){
            this.product["consumos"][1].porcentaje=100;
            data.niveles.nivel_cafe_gr =100
            data.niveles.nivel_cafe_pr =100
          }else{
            this.product["consumos"][1].porcentaje += Math.floor((this.amountToAdd*100)/100);
            data.niveles.nivel_cafe_pr += Math.floor((this.amountToAdd*100)/100);
            data.niveles.nivel_cafe_gr += this.amountToAdd;
          }
       
      } else {
        if(nombre=='Agua'){
          if(data.niveles.nivel_agua_ml+ this.amountToAdd >200){
            this.product["consumos"][0].porcentaje=100;
            data.niveles.nivel_agua_ml =200
            data.niveles.nivel_agua_pr =100
          }else{
            this.product["consumos"][0].porcentaje += Math.floor((this.amountToAdd*100)/200);
          data.niveles.nivel_agua_pr += Math.floor((this.amountToAdd*100)/200)
          data.niveles.nivel_agua_ml += this.amountToAdd;
          }
        } 
        if(nombre=='Leche'){
          if(data.niveles.nivel_leche_ml+ this.amountToAdd >200){
            this.product["consumos"][2].porcentaje=100;
            data.niveles.nivel_leche_ml =200
            data.niveles.nivel_leche_pr =100
          }else{
            this.product["consumos"][2].porcentaje += Math.floor((this.amountToAdd*100)/200);
            data.niveles.nivel_leche_pr += Math.floor((this.amountToAdd*100)/200)
            data.niveles.nivel_leche_ml += this.amountToAdd;
          }
        } 
        
      
      }
      console.log("El producto actualizado", data)
      // Actualizamos en Firebase
      this.dataService.actualizarNiveles(data,this.nombresMaquinas[this.nombre])   
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
     if (isNaN(value) || value < 0 ) {
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
    const nombre=this.nombresMaquinas[this.nombre];
    const topic = `${nombre}/nivel`;

    // Primero, verifica si ya hay una suscripción y desuscríbete
    if (this.subscription) {
      this.subscription.unsubscribe();
      console.log('Desuscripto del tópico anterior.');
    }

    
    this.subscription = this.mqttService.observe(topic).subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        this.lastLineLevels = message.payload.toString();
        console.log(message.payload.toString());
        let data = JSON.parse(message.payload.toString());
        
        // Hacer una copia profunda de this.product["consumos"] antes de modificarlo
        let anteriores = JSON.parse(JSON.stringify(this.product["consumos"]));
    
        // Actualizar los porcentajes en this.product["consumo"][0]
        this.product["consumos"][0].porcentaje = data.niveles.nivel_agua_pr;
        this.product["consumos"][1].porcentaje = data.niveles.nivel_cafe_pr;
        this.product["consumos"][2].porcentaje = data.niveles.nivel_leche_pr;
        this.product["consumos"][3].porcentaje = data.niveles.patatillas_u;
    
        console.log("Actualizado")
    
        this.actualizarUltimaFecha(message.payload.toString());
    
        //Comprobamos si los valores que vienen son iguales a los que había
        if (!this.sonNivelesIguales(this.product["consumos"], anteriores)) {
          console.log("Nuevos valores")
          this.actualizarVentas();
        } else{
          console.log("No ha cambiado nada")
        }
    
      },
      error: (error: any) => {
        this.isConnection = false;
        console.error(`Connection error: ${error}`);
      }
    });
    
  }

  onDataPointSelected(event: any) {
        // Aquí puedes acceder a la información de la barra seleccionada a través del objeto event
        console.log('Barra seleccionada:', event);
        alert("Valor: "+ event.value);

        // Puedes realizar acciones adicionales aquí, como mostrar detalles en un modal o actualizar otra parte de tu interfaz de usuario.
    }

    fechasDisponibles: string[] = [];

    initializeDates() {
      const startDate = new Date('2024-03-25');
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Se suma 1 para incluir la fecha actual

      // Generar el rango de fechas
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        console.log(currentDate)
        console.log(currentDate.toISOString().split('T')[0])
        this.fechasDisponibles.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1); // Avanzar al siguiente día

      }
    }

    initializeSelectedDate() {
      const today = new Date();
      //console.log(today)
      this.selectedDate = today.toISOString().split('T')[0];
      this.fechasDisponibles.push(this.selectedDate);
    }
    
    updateChart() {
      // Lógica para actualizar la gráfica con la fecha seleccionada
      // Aquí deberías llamar a tu servicio para obtener los datos según la fecha seleccionada y luego actualizar la gráfica
      //console.log("Fecha seleccionada: "+this.selectedDate);
     // console.log("Fechas disponibles: "+this.fechasDisponibles);
      this.actualizarVentas();
    }

}

