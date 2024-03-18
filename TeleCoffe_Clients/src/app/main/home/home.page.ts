import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isOverlayVisibleAzucar: boolean = false;
  isOVerlayVisible: boolean = false;
  amountToAdd=0;
  productoSeleccionado: any = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

  selectedCategory: string = 'cafe'; // Valor inicial para mostrar algo al inicio
  products: any = {
    cafe: [
      { name: 'Café con leche', price: '1.35', img: '../../assets/cafe_con_leche.jpg' },
      { name: 'Café americano', price: '1.15', img: '../../assets/cafe_americano.png' }
    ],
    aperitivos: [
      { name: 'Patatillas', price: '0.85', img: '../../assets/patatillas.png' }
    ],
    bebidas: [
      { name: 'Leche', price: '0.80', img: '../../assets/leche.png' }
    ]
  };

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  showOverlay(producto: any) {
    this.productoSeleccionado = producto;
    if(producto.name == "Café con leche" || producto.name == "Café americano"){
      this.isOverlayVisibleAzucar = true;
    } else{
      this.isOVerlayVisible = true;
    }
  }

  closeOverlay() {
    this.isOverlayVisibleAzucar = false;
    this.isOVerlayVisible = false;
  }
  
  addBalance() {
    console.log("Añadiendo azúcar:", this.amountToAdd);
    this.comprar(this.productoSeleccionado);
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

  comprar(producto: any){
    console.log("Comprando " + producto.name)
    const compra = {"producto": producto.name, "precio": producto.price, "fecha": new Date()};

    this.dataService.crearCompra(compra)
      .then((response: any) => {
        if (response) {
          console.log("Compra creada exitosamente")
          alert("¡Compra realizada exitosamente!")
        } else {
          alert("No se pudo realizar la compra, revisa tu saldo")
          console.log("No se pudo crear la compra.");
        }
      })
      .catch((error) => {
        console.error("Error al crear la compra:", error);
      });

      
    this.closeOverlay();

  }
}