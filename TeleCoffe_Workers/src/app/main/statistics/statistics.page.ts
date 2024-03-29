
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BackendSocketsService } from 'src/app/services/BackEndSocketService';

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

interface GraficaDataLineas {
  name: string;
  series: GraficaDataBarras[];
}

interface GraficaDataBarras {
  name: string;
  value: number;
}
 
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})

export class StatisticsPage implements OnInit, AfterViewInit{
  @ViewChild('ventaStyle', { static: false }) ventaStyle!: ElementRef;

  maquinas = ["teleco", "minas", "industriales", "biologia"]
  nombresFormales: { [key: string]: string } = {
    teleco: "Escuela de Ingienería de Telecomunicación",
    minas: "Escuela de Ingeniería de Minas y Energía",
    industriales: "Escuela de Ingienería Industrial",
    biologia: "Facultad de Biología"
  };
  ventasDiarias: { [maquina: string]: { [fecha: string]: number } } = { teleco: {}, minas: {}, industriales: {}, biologia: {}};
  graficaVentas: GraficaLineas = {
    data: [],
    viewSize: [0,0],
    xAxisLabel: 'Fecha',
    yAxisLabel: 'Número de ventas',
    showXAxisLabel: false,
    showYAxisLabel: false,
    xAxis: true,
    yAxis: true,
    gradient: false,
    legend: false
  }

  datosVentas: { precio: string; fecha: any; maquina: string, producto: string;}[]=[];

  constructor( private backendService: BackendSocketsService) { 
  }

  ngOnInit() {
    this.obtenerCompras("","");
  }

  ngAfterViewInit() {
    this.adjustGraphSize();
  }


  adjustGraphSize() {
    const widthVentas = this.ventaStyle.nativeElement.offsetWidth - 30; // Aumentar el valor para hacerlo más grande
    const heightVentas = this.ventaStyle.nativeElement.offsetHeight - 45; // Aumentar el valor para hacerlo más grande
    this.graficaVentas.viewSize = [widthVentas, heightVentas];
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

}


