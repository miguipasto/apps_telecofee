import { Component, OnInit } from '@angular/core';
import { reload } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isOverlayVisible: boolean = false;
  amountToAdd=0;
  productoSeleccionado: string="";

  constructor() { }

  ngOnInit() {
  }

  selectedCategory: string = 'cafe'; // Valor inicial para mostrar algo al inicio
  products: any = {
    cafe: [
      { name: 'Café con leche', price: '1,35€', img: '../../assets/cafe_con_leche.jpg' },
      { name: 'Café americano', price: '1,15€', img: '../../assets/cafe_americano.png' }
    ],
    aperitivos: [
      { name: 'Patatillas', price: '0,85€', img: '../../assets/patatillas.png' }
    ],
    bebidas: [
      { name: 'Leche', price: '0,80€', img: '../../assets/leche.png' }
    ]
  };

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  showOverlay(nombre:string) {
    this.isOverlayVisible = true;
    this.productoSeleccionado=nombre;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
  }
  
  addBalance() {
    console.log("Añadiendo azúcar:", this.amountToAdd);
    // Aquí puedes agregar la lógica para efectivamente añadir el saldo.
    this.closeOverlay();
  }

  incrementAmount() {
    if (this.amountToAdd < 5) {
      this.amountToAdd++;
    }
  }

  decrementAmount() {
    if (this.amountToAdd > 0) {
      this.amountToAdd--;
    }
  }

  validateAmount(event: Event) {
    let value = +(<HTMLInputElement>event.target).value;
    if (isNaN(value) || value < 0) {
      this.amountToAdd = 0;
    } else if (value > 5) {
      this.amountToAdd = 5;
    } else {
      this.amountToAdd = Math.floor(value);
    }
  }
}


