import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

interface GraficaDataBarras {
  name: string;
  value: number;
}

interface GraficaNivelDirecto {
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
}

interface GraficasHistorialProducto {
  [producto: string]: {
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

interface GraficaCircular{
  data: GraficaDataBarras[];
  viewSize: [number,number];
}

@Component({
  selector: 'app-maquinas-estadisticas',
  templateUrl: './maquinas-estadisticas.component.html',
  styleUrls: ['./maquinas-estadisticas.component.css']
})
export class MaquinasEstadisticasComponent implements OnInit {
  @ViewChild('maquinaNivelDirectoStyle', { static: false }) maquinaNivelDirectoStyle!: ElementRef;
  @ViewChild('productosHistorialStyle', { static: false }) productosHistorialStyle!: ElementRef;
  @ViewChild('masVendido', { static: false }) masVendido!: ElementRef;
  

  // Variables
  productos: string[] = ["Agua", "Leche", "Café", "Patatillas"];
  nombreMaquina: any = "";
  nombresFormales: { [key: string]: string } = {
    teleco: "Escuela de Ingienería de Telecomunicación",
    minas: "Escuela de Ingeniería de Minas y Energía",
    industriales: "Escuela de Ingienería Industrial",
    biologia: "Facultad de Biología"
  };
  nivelDirecto!: Niveles;

  // Variables MQTT
  subscription: Subscription | undefined;
  receiveNews = '';
  isConnection = false;

  // Gráficas
  graficaNivelDirecto: GraficaNivelDirecto = {
    data: [],
    viewSize: [100,100],
    xAxisLabel: '',
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
  mostrarGraficaNivelDirecto: boolean = false;

  graficasHistorialProducto: GraficasHistorialProducto = {};
  viewSizeGraficaHistorialProducto: [number, number] = [0, 0];
  mostrarGraficasHistorialProductos: boolean = false;

  graficaCircular: GraficaCircular = {
    data: [],
    viewSize: [0,0]
  }
  mostrarGraficaCircular: boolean = false;

  //Estadisiticas
  ventasDiarias: { [fecha: string]: number } = {};
  gananciasDiarias :{ [fecha: string]: number } = {};

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
    private router: Router, 
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.nombreMaquina = this.route.snapshot.paramMap.get('nombre_maquina');
    this.subscribeToTopic();
    this.historialNiveles(this.nombreMaquina,"6d","last")
    this.obtenerCompras(this.nombreMaquina,"");
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngAfterViewInit() {
    this.adjustGraphSize();
  }

  adjustGraphSize() {
    const widthCircular = this.masVendido.nativeElement.offsetWidth - 20;
    const heighCircular = this.masVendido.nativeElement.offsetHeight - 80;
    this.graficaCircular.viewSize = [widthCircular,heighCircular];
    this.mostrarGraficaCircular = true;  

    const widthMaquinaNivelDirecto = this.maquinaNivelDirectoStyle.nativeElement.offsetWidth - 60;
    const heighMaquinaNivelDirecto = this.maquinaNivelDirectoStyle.nativeElement.offsetHeight - 150;
    this.graficaNivelDirecto.viewSize = [widthMaquinaNivelDirecto,heighMaquinaNivelDirecto];
    this.mostrarGraficaNivelDirecto = true;

    const widthProductosHistorial = this.productosHistorialStyle.nativeElement.offsetWidth - 60;
    const heighProductosHistorial = this.productosHistorialStyle.nativeElement.offsetHeight - 100;
    this.viewSizeGraficaHistorialProducto = [widthProductosHistorial,heighProductosHistorial];
    this.inicializarGraficaHistorialProducto();
    this.mostrarGraficasHistorialProductos = true;
  }

  actualizarNivelDirecto(mensaje: string) {
    try {
      const datos = JSON.parse(mensaje);
      const { maquina, niveles } = datos;
  
      // Verifica si hay cambios en los niveles antes de actualizar
      if (!this.sonNivelesIguales(this.nivelDirecto, niveles)) {
        this.nivelDirecto = niveles;
      
        const newData = [
          { name: "Patatillas", value: niveles.patatillas_pr },
          { name: "Agua", value: niveles.nivel_agua_pr },
          { name: "Leche", value: niveles.nivel_leche_pr },
          { name: "Café", value: niveles.nivel_cafe_pr },
        ];

        // Actualizamos la gráfica
        this.graficaNivelDirecto.data = newData;
        
        // // Recalculamos las compras
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

  inicializarGraficaHistorialProducto() {
    this.productos.forEach(producto => {
      this.graficasHistorialProducto[producto] = {
        data: [],
        viewSize: this.viewSizeGraficaHistorialProducto,
        xAxisLabel: producto,
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

  procesarHistorial(data: any[]) {
    this.productos.forEach(producto => {
        let key = '';
        switch (producto) {
            case 'Agua':
                key = 'nivel_agua_pr';
                break;
            case 'Leche':
                key = 'nivel_leche_pr';
                break;
            case 'Café':
                key = 'nivel_cafe_pr';
                break;
            case 'Patatillas':
                key = 'patatillas_pr';
                break;
        }

        // Construye el array de datos para cada producto
        const datosProducto = data.map(registro => {
            const fecha = new Date(registro.fecha._seconds * 1000);
            // Obtiene solo el mes y el día en formato MM-DD
            const fechaFormateada = `${fecha.getMonth() + 1}-${fecha.getDate()}`;
            return {
                name: fechaFormateada,
                value: registro.niveles[key],
            };
        });

        // Asigna los datos procesados a la gráfica correspondiente
        this.graficasHistorialProducto[producto].data = datosProducto;
        //console.log(this.graficasHistorialProducto[producto].data);
    });
}

  procesarCompras(compras: any[]){
    const ventas: { [fecha: string]: number } = {};
    const ganancias: { [fecha: string]: number } = {};
    const ventasPorProducto: { [producto: string]: number } = {};

    compras.forEach(compra => {
      const fecha = new Date(compra.fecha._seconds * 1000).toISOString().split('T')[0];
      const producto = compra.producto;

      if (!ventas[fecha]) {
        ventas[fecha] = 0;
        ganancias[fecha] = 0;
      }

      ventas[fecha] += 1;
      ganancias[fecha] += parseFloat(compra.precio);

      this.gananciasTotales += parseFloat(compra.precio);
  
      // Conteo de ventas por producto
      if (!ventasPorProducto[producto]) {
        ventasPorProducto[producto] = 0;
      }
      ventasPorProducto[producto] += 1;

    });

    console.log(compras)

    //Actualizamos los datos
    this.ventasDiarias = ventas;
    this.gananciasDiarias = ganancias;
    this.actualizarGraficaCircular(ventasPorProducto);
    this.mostrarCambioPorcentualVentas();
    this.mostrarCambioPorcentualVentasSemanales();
  }

  actualizarGraficaCircular(ventasPorProducto: { [producto: string]: number }) {
    const datosGrafica: GraficaDataBarras[] = Object.keys(ventasPorProducto).map(producto => {
      return { name: producto, value: ventasPorProducto[producto] };
    });
  
    datosGrafica.sort((a, b) => b.value - a.value);
  
    // Actualizamos los datos del gráfico circular
    this.graficaCircular.data = datosGrafica;
  }

  // Función para calcular las ventas totales para un día específico
  calcularVentasTotalesDia(fecha: string): number {
    let totalVentasDia = 0;
    if (this.ventasDiarias[fecha]) {
      totalVentasDia += this.ventasDiarias[fecha];
    }
    
    return totalVentasDia;
  }

  calcularGananciasTotalesDia(fecha: string): number {
    let totalGananciasDia = 0;
    if (this.gananciasDiarias[fecha]) {
      totalGananciasDia += this.gananciasDiarias[fecha];
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

  subscribeToTopic() {

    if(this.nombreMaquina === 'teleco'){
      this.mqttPrototipoService.onConnect.subscribe(() => {
        console.log('Connected to MQTT broker.');
      });
  
      this.mqttPrototipoService.onError.subscribe(error => {
        console.error('Connection error:', error);
      });
  
      const topico = `${this.nombreMaquina}/nivel`
      this.subscription = this.mqttPrototipoService.observe(topico).subscribe({
        next: (message: IMqttMessage) => {
          this.receiveNews += message.payload.toString() + '\n';
          //console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`);
          this.actualizarNivelDirecto(message.payload.toString());
        },
        error: (error: any) => {
          console.error(`Connection error: ${error}`);
        }
      });

    } else{
      this.mqttServerService.onConnect.subscribe(() => {
        console.log('Connected to MQTT broker.');
      });
  
      this.mqttServerService.onError.subscribe(error => {
        console.error('Connection error:', error);
      });
  
      const topico = `${this.nombreMaquina}/nivel`
      this.subscription = this.mqttServerService.observe(topico).subscribe({
        next: (message: IMqttMessage) => {
          this.receiveNews += message.payload.toString() + '\n';
          //console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`);
          this.actualizarNivelDirecto(message.payload.toString());
        },
        error: (error: any) => {
          console.error(`Connection error: ${error}`);
        }
      });
    }


    
  }

  obtenerCompras(nombre_maquina: string, fecha: string) {
    this.backendService.compras(nombre_maquina, fecha).subscribe({
      next: (compras) => {
        //console.log(compras)
        this.procesarCompras(compras);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  historialNiveles(nombre_maquina: string, fecha: string, cantidad: string) {
      this.backendService.niveles(nombre_maquina, fecha, cantidad).subscribe({
        next: (historial) => {
          this.procesarHistorial(historial.data);
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
}
