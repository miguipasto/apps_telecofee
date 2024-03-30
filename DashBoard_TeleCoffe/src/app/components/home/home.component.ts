import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { LegendPosition } from '@swimlane/ngx-charts';


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
      legend: true
    }
    mostrarGraficaVentas: boolean = false;

  graficaCircular: GraficaCircular = {
    data: [],
    viewSize: [0,0]
  }
  mostrarGraficaCircular: boolean = false;

  constructor(private mqttService: MqttService, private backendService: BackendService) {}

  ngOnInit(): void {
    this.subscribeToTopic();
    this.inicializarGraficasNiveles();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit() {
    this.adjustGraphSize();
  }

  adjustGraphSize() {
    const width = this.maquinasNivelStyle.nativeElement.offsetWidth - 50;
    const height = this.maquinasNivelStyle.nativeElement.offsetHeight - 50;
    this.viewSizeNivel = [width, height];
    this.inicializarGraficasNiveles();
    this.mostrarGraficasNivel = true;

    const widthVentas = this.ventasStyle.nativeElement.offsetWidth - 60;
    const heightVentas = this.ventasStyle.nativeElement.offsetHeight - 80;
    this.graficaVentas.viewSize = [widthVentas,heightVentas];
    this.mostrarGraficaVentas = true;    

    const widthCircular = this.masVendido.nativeElement.offsetWidth - 20;
    const heightCircular = this.masVendido.nativeElement.offsetHeight - 30;
    this.graficaCircular.viewSize = [widthCircular,heightCircular];
    this.mostrarGraficaCircular = true;  

    
  }

  inicializarGraficasNiveles() {
    this.maquinas.forEach(maquina => {
      const nombreFormal = this.nombresFormales[maquina]; 
      this.graficasNiveles[maquina] = {
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
  
    // Actualizar los datos de la gráfica de ventas y la gráfica circular
    this.ventasDiarias = ventas;
    this.actualizarGraficaVentas();
    this.actualizarGraficaCircular(ventasPorProducto); // Aquí actualizamos la gráfica circular
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
        
        // Asumiendo que quieres actualizar una gráfica de barras como la del ejemplo:
        this.graficasNiveles[maquina].data = newData;
        
        // Recalculamos las compras
        this.obtenerCompras("","");
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
    this.mqttService.onConnect.subscribe(() => {
      console.log('Connected to MQTT broker.');
    });

    this.mqttService.onError.subscribe(error => {
      console.error('Connection error:', error);
    });

    // Nos suscribimos a todos los tópicos
    for(const maquina of this.maquinas){
      const topico = `${maquina}/nivel`
      this.subscription = this.mqttService.observe(topico).subscribe({
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
  }

}
