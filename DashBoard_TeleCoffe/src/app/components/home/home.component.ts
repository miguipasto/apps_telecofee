import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { ChartComponent, ApexAxisChartSeries, ApexNonAxisChartSeries, ApexDataLabels, ApexChart, ApexXAxis, ApexTitleSubtitle } from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

export type CircularChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
};

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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChildren(ChartComponent) charts!: QueryList<ChartComponent>;
  chartOptions: { [key: string]: ChartOptions } = {};
  circularChartOptions: CircularChartOptions  = {
    series: [44, 55, 67, 83],
      chart: {
        type: "donut",
      },
      labels: ["Teleco", "Minas", "Industriales", "Biologia"],
      title: {
        text: "Productos más vendidos",
      },
      dataLabels: {
        enabled: true,
      },
  };
  ventasChartOptions: ChartOptions = {
    series: [{
      name: 'Ventas',
      data: [1,2,3]
    }],
    chart: {
      type: 'line',
      height: 350
    },
    xaxis: {
      categories: "2024"
    },
    title: {
      text: `Ventas diarias`,
      align: 'left'
    },
  };


  maquinas = ["teleco", "minas", "industriales", "biologia"]
  nombresFormales: { [key: string]: string } = {
    teleco: "Escuela de Ingienería de Telecomunicación",
    minas: "Escuela de Ingeniería de Minas y Energía",
    industriales: "Escuela de Ingienería Industrial",
    biologia: "Facultad de Biología"
  };
  estadoMaquinas: EstadoMaquina = {};

  // Variables MQTT
  subscription: Subscription | undefined;
  receiveNews = '';
  isConnection = false;

  ventasDiarias: { [maquina: string]: { [fecha: string]: number } } = {
    teleco: {
      "2024-03-21": 10,
      "2024-03-22": 7,
      "2024-03-23": 8,
      "2024-03-24": 5,
      "2024-03-25": 9,
    },
    minas: {
      "2024-03-21": 6,
      "2024-03-22": 9,
      "2024-03-23": 4,
      "2024-03-24": 8,
      "2024-03-25": 7,
    },
    industriales: {
      "2024-03-21": 8,
      "2024-03-22": 11,
      "2024-03-23": 9,
      "2024-03-24": 6,
      "2024-03-25": 5,
    },
    biologia: {
      "2024-03-21": 7,
      "2024-03-22": 5,
      "2024-03-23": 6,
      "2024-03-24": 10,
      "2024-03-25": 8,
    },
  };
  

  constructor(private mqttService: MqttService) {}


  ngOnInit(): void {
    this.inicializarGraficas();
    this.inicializarGraficaDeVentas();
    this.subscribeToTopic();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  actualizarEstadoMaquina(mensaje: string) {
    try {
      const datos = JSON.parse(mensaje);
      const { maquina, niveles } = datos;
      this.estadoMaquinas[maquina] = niveles;
  
      const newData = [
        niveles.patatillas_pr,
        niveles.nivel_agua_pr,
        niveles.nivel_leche_pr,
        niveles.nivel_cafe_pr,
      ];
  
      // Encuentra la gráfica correcta basada en el nombre de la máquina y actualiza sus series
      const chartIndex = this.maquinas.indexOf(maquina);
      if(chartIndex !== -1 && this.charts && this.charts.toArray().length > chartIndex) {
          const chart = this.charts.toArray()[chartIndex];
          chart.updateSeries([
            {
              data: newData
            }
          ]);
      }
  
      console.log(datos);
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
  }

  // Gráficas
  inicializarGraficas(){
    this.maquinas.forEach(maquina => {
      const nombreFormal = this.nombresFormales[maquina]; 
      this.chartOptions[maquina] = {
        series: [
          {
            name: "Niveles",
            data: []
          }
        ],
        chart: {
          type: "bar",
        },
        title: {
          text: `Niveles de la ${nombreFormal}`,
          style: {
            fontSize: '16px',
          }
        },
        xaxis: {
          categories: ["Patatillas", "Agua", "Leche", "Café"]
        },
      };
    });
  }

  inicializarGraficaDeVentas() {
    // Obtener todas las fechas de las ventas
    const fechas = Object.keys(this.ventasDiarias['teleco']); // Asumiendo que todas tienen las mismas fechas
  
    // Preparar las series para cada máquina
    const seriesParaCadaMaquina = this.maquinas.map(maquina => {
        const dataDeVentas = fechas.map(fecha => {
            return this.ventasDiarias[maquina][fecha] || 0;
        });
        return {
            name: maquina,
            data: dataDeVentas
        };
    });

    // Configurar las opciones del gráfico
    this.ventasChartOptions = {
        series: seriesParaCadaMaquina,
        chart: {
            type: 'line',
            height: '300px',
        },
        xaxis: {
            categories: fechas
        },
        title: {
            text: 'Ventas Diarias por Máquina',
            align: 'left'
        },
    };
}

  

  // Funciones MQTT
  private subscribeToTopic() {
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
          console.log(`Received message: ${message.payload.toString()} from topic: ${topico}`);
          this.actualizarEstadoMaquina(message.payload.toString());
        },
        error: (error: any) => {
          console.error(`Connection error: ${error}`);
        }
      });
    }
  }
  
}
