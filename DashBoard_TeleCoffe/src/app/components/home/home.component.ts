import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { Router } from '@angular/router';
import { MqttServerService } from 'src/app/services/mqtt-server.service';
import { MqttPrototipoService } from 'src/app/services/mqtt-prototipo.service';

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

interface GraficaDataBarras {
  name: string;
  value: number;
}

interface GraficaDataLineas {
  name: string;
  series: GraficaDataBarras[];
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

interface GraficaLineas{
  data: GraficaDataLineas[];
  viewSize: [number,number];
  xAxisLabel: string;
  yAxisLabel: string;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  xAxis: boolean;
  yAxis: boolean;
  gradient: boolean;
  legend: boolean;
}

interface GraficaCircular{
  data: GraficaDataBarras[];
  viewSize: [number,number];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  @ViewChild('maquinasNivelStyle', { static: false }) maquinasNivelStyle!: ElementRef;
  @ViewChild('ventasStyle', { static: false }) ventasStyle!: ElementRef;
  @ViewChild('masVendido', { static: false }) masVendido!: ElementRef;

  // Variables
  maquinas = ["teleco", "minas", "industriales", "biologia"]
  nombresFormales: { [key: string]: string } = {
    teleco: "Escuela de Ingienería de Telecomunicación",
    minas: "Escuela de Ingeniería de Minas y Energía",
    industriales: "Escuela de Ingienería Industrial",
    biologia: "Facultad de Biología"
  };
  estadoMaquinas: EstadoMaquina = {};
  ventasDiarias: { [maquina: string]: { [fecha: string]: number } } = { teleco: {}, minas: {}, industriales: {}, biologia: {}};
  gananciasDiarias : { [maquina: string]: { [fecha: string]: number } } = { teleco: {}, minas: {}, industriales: {}, biologia: {}};

  // Variables MQTT
  subscription: Subscription | undefined;
  receiveNews = '';
  isConnection = false;

  // Gráficas
  graficasNiveles: GraficaNiveles = {};
  viewSizeNivel: [number, number] = [0, 0];
  mostrarGraficasNivel: boolean = false;

  graficaVentas: GraficaLineas = {
    data: [],
    viewSize: [0,0],
    xAxisLabel: 'Fecha',
    yAxisLabel: 'Número de ventas',
    showXAxisLabel: true,
    showYAxisLabel: true,
    xAxis: true,
    yAxis: true,
    gradient: false,
    legend: false
  }
  mostrarGraficaVentas: boolean = false;

  graficaCircular: GraficaCircular = {
    data: [],
    viewSize: [0,0]
  }
  mostrarGraficaCircular: boolean = false;

  //Estadisiticas
  ventasHoy: number = 0;
  ventasAyer: number = 0;
  cambioPorcentual: any = 0;
  gananciasHoy: number = 0;
  gananciasAyer: number = 0;
  cambioPorcentualGanancias: any = 0;

  ventasSemanaActual: number = 0;
  ventasSemanaAnterior: number = 0;
  cambioPorcentualSemanal: any = 0;
  gananciasSemanaActual: number = 0;
  gananciasSemanaAnterior: number = 0;
  cambioPorcentualGananciasSemanal: any = 0;

  gananciasTotales: any = 0;

  constructor(
    private mqttServerService: MqttServerService,
    private mqttPrototipoService: MqttPrototipoService,
    private backendService: BackendService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToTopic();
    this.obtenerCompras("","")
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit() {
    this.adjustGraphSize();
  }

  adjustGraphSize() {
    const width = this.maquinasNivelStyle.nativeElement.offsetWidth - 50;
    const height = this.maquinasNivelStyle.nativeElement.offsetHeight - 100;
    this.viewSizeNivel = [width, height];
    this.inicializarGraficasNiveles();
    this.mostrarGraficasNivel = true;

    const widthVentas = this.ventasStyle.nativeElement.offsetWidth - 60;
    const heighInferior = this.ventasStyle.nativeElement.offsetHeight - 80;
    this.graficaVentas.viewSize = [widthVentas,heighInferior];
    this.mostrarGraficaVentas = true;    

    const widthCircular = this.masVendido.nativeElement.offsetWidth - 20;
    this.graficaCircular.viewSize = [widthCircular,heighInferior];
    this.mostrarGraficaCircular = true;  

    
  }

  inicializarGraficasNiveles() {
    this.maquinas.forEach(maquina => {
      const nombreFormal = this.nombresFormales[maquina]; 
      this.graficasNiveles[maquina] = {
        data: [],
        viewSize: this.viewSizeNivel,
        xAxisLabel: nombreFormal,
        yAxisLabel: 'Porcentaje (%)',
        showXAxisLabel: false,
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
        this.procesarCompras(compras);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
  
  procesarCompras(compras: any[]){
    const ventas: { [maquina: string]: { [fecha: string]: number } } = {};
    const ganancias: { [maquina: string]: { [fecha: string]: number } } = {};
    const ventasPorProducto: { [producto: string]: number } = {};
    
    compras.forEach(compra => {
      const fecha = new Date(compra.fecha._seconds * 1000).toISOString().split('T')[0];
      const maquina = compra.maquina;
      const producto = compra.producto;
      
      if (!ventas[maquina]) {
        ventas[maquina] = {};
        ganancias[maquina] = {};
      }
      if (!ventas[maquina][fecha]) {
        ventas[maquina][fecha] = 0;
        ganancias[maquina][fecha] = 0;
      }
  
      ventas[maquina][fecha] += 1;
      ganancias[maquina][fecha] += parseFloat(compra.precio);

      this.gananciasTotales += parseFloat(compra.precio);
  
      // Conteo de ventas por producto
      if (!ventasPorProducto[producto]) {
        ventasPorProducto[producto] = 0;
      }
      ventasPorProducto[producto] += 1;
    });
  
    // Actualizar los datos de la gráfica de ventas y la gráfica circular
    this.ventasDiarias = ventas;
    this.gananciasDiarias = ganancias;
    this.actualizarGraficaVentas();
    this.actualizarGraficaCircular(ventasPorProducto); 
    this.mostrarCambioPorcentualVentas();
    this.mostrarCambioPorcentualVentasSemanales();
  }

  // Función para calcular las ventas totales para un día específico
  calcularVentasTotalesDia(fecha: string): number {
    let totalVentasDia = 0;
    for (const maquina of this.maquinas) {
      if (this.ventasDiarias[maquina][fecha]) {
        totalVentasDia += this.ventasDiarias[maquina][fecha];
      }
    }
    return totalVentasDia;
  }

  calcularGananciasTotalesDia(fecha: string): number {
    let totalGananciasDia = 0;
    for (const maquina of this.maquinas) {
      if (this.gananciasDiarias[maquina][fecha]) {
        totalGananciasDia += this.gananciasDiarias[maquina][fecha];
      }
    }
    return totalGananciasDia;
  }

  // Función para calcular y mostrar la estadística de cambio porcentual en ventas
  mostrarCambioPorcentualVentas() {
    const hoy = new Date().toISOString().split('T')[0];
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    this.ventasHoy = this.calcularVentasTotalesDia(hoy);
    this.ventasAyer = this.calcularVentasTotalesDia(ayer);
    this.gananciasHoy = this.calcularGananciasTotalesDia(hoy);
    this.gananciasAyer = this.calcularGananciasTotalesDia(ayer);

    this.cambioPorcentual = (((this.ventasHoy - this.ventasAyer) / this.ventasAyer) * 100).toFixed(2);
    this.cambioPorcentualGanancias = (this.gananciasHoy - this.gananciasAyer).toFixed(2);
  }

  calcularVentasTotalesSemana(semana: number, año: number): number {
    let totalVentasSemana = 0;
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(año, 0, (semana - 1) * 7 + i);
      const fechaISO = fecha.toISOString().split('T')[0];
      totalVentasSemana += this.calcularVentasTotalesDia(fechaISO);
    }
    return totalVentasSemana;
  }

  calcularGananciasTotalesSemana(semana: number, año: number): number {
    let totalGanaciasSemana = 0;
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(año, 0, (semana - 1) * 7 + i);
      const fechaISO = fecha.toISOString().split('T')[0];
      totalGanaciasSemana += this.calcularGananciasTotalesDia(fechaISO);
    }
    return totalGanaciasSemana;
  }

  obtenerNumeroSemana(fecha: Date): number {
    const primerDiaAnio = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha.getTime() - primerDiaAnio.getTime()) / (24 * 60 * 60 * 1000)) + ((primerDiaAnio.getDay() + 6) % 7);
    return Math.ceil(dias / 7);
  }

  mostrarCambioPorcentualVentasSemanales() {
    const hoy = new Date();
    const numeroSemanaActual = this.obtenerNumeroSemana(hoy);
    const añoActual = hoy.getFullYear();
    
    let numeroSemanaAnterior = numeroSemanaActual - 1;
    let añoSemanaAnterior = añoActual;
    if (numeroSemanaActual === 1) {
      numeroSemanaAnterior = 52; 
      añoSemanaAnterior = añoActual - 1;
    }
  
    this.ventasSemanaAnterior = this.calcularVentasTotalesSemana(numeroSemanaAnterior, añoSemanaAnterior);
    this.ventasSemanaActual = this.calcularVentasTotalesSemana(numeroSemanaActual, añoActual);

    this.gananciasSemanaAnterior = this.calcularGananciasTotalesSemana(numeroSemanaAnterior, añoSemanaAnterior);
    this.gananciasSemanaActual = this.calcularGananciasTotalesSemana(numeroSemanaActual, añoActual);

    this.cambioPorcentualSemanal = (((this.ventasSemanaActual - this.ventasSemanaAnterior) / this.ventasSemanaAnterior) * 100).toFixed(2);
    this.cambioPorcentualGananciasSemanal = (this.gananciasSemanaActual - this.gananciasSemanaAnterior).toFixed(2);
  }
  
  actualizarGraficaVentas() {
    // Recolectar todas las fechas de todas las máquinas
    let todasLasFechas: Set<string> = new Set();
    for (const maquina of Object.keys(this.ventasDiarias)) {
      const ventas = this.ventasDiarias[maquina];
      Object.keys(ventas).forEach(fecha => todasLasFechas.add(fecha));
    }
    // Convertir a array y ordenar
    const fechasOrdenadas = Array.from(todasLasFechas).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
    // Construir la gráfica de ventas usando las fechas ordenadas
    const data: GraficaDataLineas[] = this.maquinas.map(maquina => {
      const series: GraficaDataBarras[] = fechasOrdenadas.map(fecha => {
        const valor = this.ventasDiarias[maquina][fecha] || 0;
        return { name: fecha, value: valor };
      });
  
      return {
        name: this.nombresFormales[maquina], 
        series: series
      };
    });
  
    this.graficaVentas.data = data;
  }

  actualizarGraficaCircular(ventasPorProducto: { [producto: string]: number }) {
    // Transformamos las ventas por producto en el formato de datos para el gráfico
    const datosGrafica: GraficaDataBarras[] = Object.keys(ventasPorProducto).map(producto => {
      return { name: producto, value: ventasPorProducto[producto] };
    });
  
    // Ordenamos los datos para asegurar que los más vendidos aparezcan primero
    datosGrafica.sort((a, b) => b.value - a.value);
  
    // Actualizamos los datos del gráfico circular
    this.graficaCircular.data = datosGrafica;
  }
  

  actualizarEstadoMaquina(mensaje: string) {
    try {
      const datos = JSON.parse(mensaje);
      const { maquina, niveles } = datos;
  
      // Verifica si hay cambios en los niveles antes de actualizar
      if (!this.sonNivelesIguales(this.estadoMaquinas[maquina], niveles)) {
        this.estadoMaquinas[maquina] = niveles;
  
        const newData = [
          { name: "Patatillas", value: niveles.patatillas_pr },
          { name: "Agua", value: niveles.nivel_agua_pr },
          { name: "Leche", value: niveles.nivel_leche_pr },
          { name: "Café", value: niveles.nivel_cafe_pr },
        ];
        
        this.graficasNiveles[maquina].data = newData;
        
        // Recalculamos las compras
        //this.obtenerCompras("","");
      }
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
  }

  sonNivelesIguales(niveles1: Niveles, niveles2: Niveles): boolean {
    if (!niveles1 || !niveles2) return false;
  
    return niveles1.patatillas_pr === niveles2.patatillas_pr &&
           niveles1.nivel_agua_pr === niveles2.nivel_agua_pr &&
           niveles1.nivel_leche_pr === niveles2.nivel_leche_pr &&
           niveles1.nivel_cafe_pr === niveles2.nivel_cafe_pr &&
           niveles1.nivel_agua_ml === niveles2.nivel_agua_ml &&
           niveles1.nivel_leche_ml === niveles2.nivel_leche_ml &&
           niveles1.nivel_cafe_gr === niveles2.nivel_cafe_gr;
  }

  // Funciones MQTT
  subscribeToTopic() {
    // Server
    this.mqttServerService.onConnect.subscribe(() => {
      console.log('Connected to MQTT broker - Server.');
    });

    this.mqttServerService.onError.subscribe(error => {
      console.error('Connection error:', error);
    });

    // Nos suscribimos a todos los tópicos
    for(const maquina of this.maquinas){
      const topico = `${maquina}/nivel`
      this.subscription = this.mqttServerService.observe(topico).subscribe({
        next: (message: IMqttMessage) => {
          this.receiveNews += message.payload.toString() + '\n';
          //console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`);
          this.actualizarEstadoMaquina(message.payload.toString());
        },
        error: (error: any) => {
          console.error(`Connection error: ${error}`);
        }
      });
    }

    // Nos suscribimos a todos los tópicos
    for(const maquina of this.maquinas){
      const topico = `${maquina}/compra`
      this.subscription = this.mqttServerService.observe(topico).subscribe({
        next: (message: IMqttMessage) => {
          this.receiveNews += message.payload.toString() + '\n';
          //console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`)
          if(message.payload.toString().startsWith("SUCCESS")){
            this.sleep(3);
            this.obtenerCompras("","")
          }
          
        },
        error: (error: any) => {
          console.error(`Connection error: ${error}`);
        }
      });
    }
    /* ********************************** */
    // Prototipo
    this.mqttPrototipoService.onConnect.subscribe(() => {
      console.log('Connected to MQTT broker - Prototipo.');
    });

    this.mqttPrototipoService.onError.subscribe(error => {
      console.error('Connection error:', error);
    });

    // Nos suscribimos a todos los tópicos
    this.subscription = this.mqttPrototipoService.observe('teleco/nivel').subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        //console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`);
        this.actualizarEstadoMaquina(message.payload.toString());
      },
      error: (error: any) => {
        console.error(`Connection error: ${error}`);
      }
    });


    this.subscription = this.mqttPrototipoService.observe('teleco/compra').subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        //console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`)
        if(message.payload.toString().startsWith("SUCCESS")){
          this.sleep(5);
          this.obtenerCompras("","")
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
  

  redirigir_maquinasEstadisiticas(nombnre_maquina: string){
    this.router.navigate(['/home', nombnre_maquina]);
  }

}
