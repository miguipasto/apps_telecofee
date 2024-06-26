import { Component, OnInit } from '@angular/core';
import { reload } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isOverlayVisible: boolean = false;
  amountToAdd = 0;
  productoSeleccionado: string = "";

  constructor(private router: Router) { }

  ngOnInit() {
  }

  products: any[] = [
    { name: 'Telecomunicación', img: '../../assets/maquina.png' },
    { name: 'Industriales', img: '../../assets/maquina.png' },
    { name: 'Minas', img: '../../assets/maquina.png' },
    { name: 'Biología', img: '../../assets/maquina.png' },
  ];


  redirect_to_elementos(nombre: string) {
    this.router.navigate(['/main/main/elementos/', nombre]);
  }

}