import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  compras: any = [
    { id: 1, producto: 'Café Americano', precio: '1,15€', fecha: '01/01/2024'},
    { id: 2, producto: 'Café Americano', precio: '1,15€', fecha: '02/01/2024'},
    { id: 3, producto: 'Patatas', precio: '0,85€', fecha: '02/01/2024'},
    { id: 4, producto: 'Café con Leche', precio: '1,35€', fecha: '03/01/2024'},
    
  ];

}
