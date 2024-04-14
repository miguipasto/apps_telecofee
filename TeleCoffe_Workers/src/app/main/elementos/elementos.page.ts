import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { BackendSocketsService } from 'src/app/services/BackEndSocketService';
import { MqttServerService } from 'src/app/services/mqtt-server.service';
import { MqttPrototipoService } from 'src/app/services/mqtt-prototipo.service';

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
  fechasDisponibles: string[] = [];
  isLoading: boolean = true;

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
  nombre: string = "";
  mqttClient: any;


  private subscription: Subscription | undefined;
  public receiveNews = '';
  public lastLineLevels = "";
  public isConnection = false;


  constructor(
    private route: ActivatedRoute, 
    private router:Router, 
    private mqttServerService: MqttServerService, 
    private mqttPrototipoService : MqttPrototipoService,
    private dataService: DataService, 
    private backendService: BackendSocketsService, 
    public alertController: AlertController) { 
  }

  ngOnInit() {
    this.selectedDate='' 
    this.route.paramMap.subscribe(params => {
      const nombre = params.get('nombre');
      if (nombre) {

        this.nombre = nombre;

        if(this.nombresMaquinas[this.nombre] === 'teleco'){
          this.mqttClient = this.mqttPrototipoService;
        } else{
          this.mqttClient = this.mqttServerService;
        }

        
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
    const width = 330; // Ancho de la pantalla menos el espacio de margen
    const height = 370; // Altura deseada

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
    const ultimos7Dias = this.obtenerUltimos7Dias();
    datos.forEach(data => {
      const fecha2 = new Date(data.fecha._seconds * 1000).toISOString().split('T')[0];
      const nivel_agua = data.niveles.nivel_agua_pr;
      const nivel_cafe = data.niveles.nivel_cafe_pr;
      const nivel_leche = data.niveles.nivel_leche_pr;
      const nivel_patatillas = data.niveles.patatillas_pr;

      if(ultimos7Dias.includes(fecha2)){
        // Actualizar los datos de las gráficas correspondientes
        const fecha=this.convertir_fecha(fecha2)
        this.graficasNiveles['agua'].data.push({ name: fecha, value: nivel_agua });
        this.graficasNiveles['cafe'].data.push({ name: fecha, value: nivel_cafe });
        this.graficasNiveles['leche'].data.push({ name: fecha, value: nivel_leche });
        this.graficasNiveles['patatillas'].data.push({ name: fecha, value: nivel_patatillas });

      }
    
    });
    
  }

  actualizarUltimaFecha(message: any) {
    let data = JSON.parse(message);
    const fecha2 = new Date().toISOString().split('T')[0];
    const nivel_agua = data.niveles.nivel_agua_pr;
    const nivel_cafe = data.niveles.nivel_cafe_pr;
    const nivel_leche = data.niveles.nivel_leche_pr;
    const nivel_patatillas = data.niveles.patatillas_pr;
  
    // Encuentra el índice del último elemento en el arreglo de datos para cada tipo de producto
    const fecha=this.convertir_fecha(fecha2)
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
      const fecha= this.convertir_fecha(this.selectedDate)
      this.backendService.ventas(this.nombresMaquinas[this.nombre], fecha).subscribe({
        next: (ventas) => {
          this.procesarVentas(ventas);
        },
        error: (error) => {
          console.error(error);
        }
      });

   
  }

  sonNivelesIguales(niveles1: any, niveles2: any): boolean {
    return JSON.stringify(niveles1) === JSON.stringify(niveles2);
  }


  actualizarEstadoMaquina() {
    try {

      this.backendService.ObtenerDatos(this.nombresMaquinas[this.nombre]).subscribe({
        next: (response) => {
          if (response.success) {
            const data = response.data;
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
      // Actualizamos en Firebase
      this.dataService.actualizarNiveles(data,this.nombresMaquinas[this.nombre])   
      // Avisamos por MQTT
      this.nuevaReposicon(data['maquina']);

      //alert("Producto actualizado") 
      this.presentAlert("Producto actualizado correctamente.","")

      console.log("Actualizando producto:", this.amountToAdd);
      this.closeOverlay();
    }
  }

  nuevaReposicon(maquina : String){
    this.mqttClient.publish(`reposicion`, `${maquina}`).subscribe({
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

  async presentAlert(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: ['OK'],
    });
  
    await alert.present();
  }

  subscribeToTopic(maquina : String) {
    this.isConnection = true;
    const nombre = this.nombresMaquinas[this.nombre];
    const topic = `${nombre}/nivel`;
    const topic_compra = `${nombre}/compra`;

    // Primero, verifica si ya hay una suscripción y desuscríbete
    if (this.subscription) {
      this.subscription.unsubscribe();
      console.log('Desuscripto del tópico anterior.');
    }

    
    this.subscription = this.mqttClient.observe(topic).subscribe({
      next: (message: IMqttMessage) => {
        this.isLoading = false;
        this.receiveNews += message.payload.toString() + '\n';
        this.lastLineLevels = message.payload.toString();
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
      },
      error: (error: any) => {
        this.isConnection = false;
        console.error(`Connection error: ${error}`);
      }
    });

    this.subscription = this.mqttClient.observe(topic_compra).subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        if(message.payload.toString().startsWith("SUCCESS")){
          this.sleep(5);
          this.actualizarVentas();
        }
        
      },
      error: (error: any) => {
        console.error(`Connection error: ${error}`);
      }
    });
    
  }

  async sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  initializeDates() {
    this.fechasDisponibles = [];
    const startDate = new Date('2024-03-25');
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Se suma 1 para incluir la fecha actual
  
    // Función para obtener la fecha en formato 'dd-mm-yyyy'
    function obtenerFormatoFecha(fecha: Date) {
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11, por eso sumamos 1
      const año = fecha.getFullYear();
      
      // Asegurarse de que haya dos dígitos en día y mes
      const diaStr = (dia < 10) ? '0' + dia : dia;
      const mesStr = (mes < 10) ? '0' + mes : mes;
      
      return diaStr + '-' + mesStr + '-' + año;
    }
  
    // Generar el rango de fechas
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      this.fechasDisponibles.push(obtenerFormatoFecha(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // Avanzar al siguiente día
    }
  }
    

  initializeSelectedDate() {
    const today = new Date();
    const hoy= this.obtenerFormatoFecha(today)
    this.selectedDate = hoy.toString().split('T')[0];
    this.fechasDisponibles.push(this.selectedDate);
  }
    
  updateChart() {
    this.actualizarVentas();
  }

  obtenerUltimos7Dias(): string[] {
    const ultimos7Dias: string[] = [];
    const fechaActual = new Date();
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaActual);
      fecha.setDate(fecha.getDate() - i);
      ultimos7Dias.push(fecha.toISOString().split('T')[0]);
    }
    return ultimos7Dias;
  }

  convertir_fecha(fecha:string){
    const partes_fecha = fecha.split('-')
    const fecha_invertida = partes_fecha[2] + '-' + partes_fecha[1] + '-' + partes_fecha[0]
    return fecha_invertida
  }

  // Función para obtener la fecha en formato 'dd-mm-yyyy'
  obtenerFormatoFecha(fecha: Date) {
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11, por eso sumamos 1
    const año = fecha.getFullYear();
    
    // Asegurarse de que haya dos dígitos en día y mes
    const diaStr = (dia < 10) ? '0' + dia : dia;
    const mesStr = (mes < 10) ? '0' + mes : mes;
    
    return diaStr + '-' + mesStr + '-' + año;
  }
      
}

