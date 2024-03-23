//import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import * as apex from "ng-apexcharts";
import { DataService, MyData } from 'src/app/services/data.service';
import { HttpClient} from '@angular/common/http';
import {ApexXAxis } from 'ng-apexcharts';

   

export type ChartOptions = {
  xaxis: ApexXAxis;
  };
  
@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.page.html',
  styleUrls: ['./elementos.page.scss'],
})
export class ElementosPage implements OnInit{

  isOverlayVisible: boolean = false;
  amountToAdd!: number | null;
  productoSeleccionado: string = "";
  nombre: string = ""; // Cambiado a string



  series!: apex.ApexAxisChartSeries;
  chart!: apex.ApexChart;
  title!: apex.ApexTitleSubtitle;
  //xaxis!: apex.ApexXAxis;
  datos: any[] = [];
  datos_fecha: String[]=[]
  datos_porcentaje: number[]=[]


  constructor(private route: ActivatedRoute, private router:Router, private http: HttpClient) { 
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.nombre = params.get('nombre') || ''; // Obtener el valor del parámetro 'nombre' y asignarlo a nombre
    });
  
    this.http.get<any>('assets/datos.JSON').subscribe(data => {
      console.log(data);
      data.datos.forEach((dato: { fecha: string; porcentaje: number; }) => {
        this.datos_fecha.push(dato.fecha);
        this.datos_porcentaje.push(dato.porcentaje);
      });

  
    for (let i = 0; i < this.datos_fecha.length; i++) {
      this.datos.push({
        x: this.datos_fecha[i],
        y: this.datos_porcentaje[i]
      });
    }
      
      // Inicializar las opciones del gráfico después de obtener los datos
      this.initializeChartOption();
    });
  }
  
  private initializeChartOption(): void {
    this.title = {
      text: 'Nivel de ' + this.selectedCategory
    };
  
    this.series = [{
      name: 'Porcentaje',
      data: this.datos  
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
  }

  calcularPorcentaje(porcentaje: number): number {
    // Limitar el porcentaje entre 0 y 100
    const porcentajeLimitado = Math.max(0, Math.min(100, porcentaje));
    // Devolver la altura del tanque en función del porcentaje (asumiendo que la altura del tanque es fija)
    return porcentajeLimitado;
  }

  obtenerColorPorcentaje(porcentaje: number): string {
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
    }
  }

  obtenerColorTanque(nombre:string): string {
    if (nombre==("Agua")) {
        return  rgb(163, 204, 253);
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
    var indice:number=0;
    if(nombre=='Patatillas') {
      indice=3;
      console.log(this.product["consumos"][indice].porcentaje);
      this.product["consumos"][indice].porcentaje = (this.product["consumos"][indice].porcentaje)+(this.amountToAdd);
    }else{
       if(nombre=='Agua') indice=0;
      if(nombre=='Café') indice=1;
      if(nombre=='Leche') indice=2;
      if(this.amountToAdd!=null) this.product["consumos"][indice].porcentaje = Math.floor((this.amountToAdd*100)/3);
    }

    alert("Producto actualizado") 
    console.log("Actualizando producto:", this.amountToAdd);
    this.closeOverlay();
  }

  validateAmount(event: Event) {
    var value = +(<HTMLInputElement>event.target).value;
    if(this.productoSeleccionado=="Patatillas"){

      if (isNaN(value) || value < 0) {
        this.amountToAdd = 0;
      }else if (value > 5) {
        this.amountToAdd = 4;
      } else {
        this.amountToAdd = Math.floor(value);
      }
    }else{
      if (isNaN(value) || value < 0) {
        this.amountToAdd = 0;
      }else if (value > 3) {
        this.amountToAdd = 3;
      } else {
        this.amountToAdd = value;
      }
    }
    
  }



}
function rgb(arg0: number, arg1: number, arg2: number): string {
  throw new Error('Function not implemented.');
}

