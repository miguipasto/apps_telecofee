import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.page.html',
  styleUrls: ['./elementos.page.scss'],
})
export class ElementosPage implements OnInit {

  isOverlayVisible: boolean = false;
  amountToAdd!: number | null;
  productoSeleccionado: string = "";
  nombre: string = ""; // Cambiado a string

  constructor(private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.nombre = params.get('nombre') || ''; // Obtener el valor del parámetro 'nombre' y asignarlo a nombre
    });
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
    if (categoria === 'consumos' || categoria === 'ventas') {
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

