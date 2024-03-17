import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-elementos',
  templateUrl: './elementos.page.html',
  styleUrls: ['./elementos.page.scss'],
})
export class ElementosPage implements OnInit {

  isOverlayVisible: boolean = false;
  amountToAdd = 0;
  productoSeleccionado: string = "";
  nombre: string = ""; // Cambiado a string

  constructor(private route: ActivatedRoute) { }

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
  }

  selectedCategory: string = 'consumos'; // Valor inicial para mostrar algo al inicio
  product: any = {
    consumos: [
      { name: 'Agua' },
      { name: 'Café'},
      { name: 'Leche'},
      { name: 'Patatillas'}
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
  
}
