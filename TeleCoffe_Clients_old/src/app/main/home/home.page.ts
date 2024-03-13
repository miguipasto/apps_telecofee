import { Component, OnInit } from '@angular/core';
import { reload } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

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

}
