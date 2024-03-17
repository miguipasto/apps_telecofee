import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  userData : any;
  wallet : number = 0;
  nombre : string = "";
  compras : any = [];
  isOverlayVisible: boolean = false;
  amountToAdd: number = 0;


  constructor(private dataService : DataService) { }

  async ngOnInit() {
    this.userData = await this.dataService.obetenerDatosUsuario();
    if (this.userData) {
      this.wallet = this.userData.saldo;
      this.nombre = this.userData.nombre;
    }

    this.compras = await this.dataService.obtenerComprasUsuario();
    console.log(this.compras)
  }

  showOverlay() {
    this.isOverlayVisible = true;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
  }

  async addBalance() {
    console.log("Añadiendo saldo:", this.amountToAdd);
    
    this.wallet = this.amountToAdd + this.wallet;
    await this.dataService.actualizarSaldoUsuario(this.wallet);

    this.closeOverlay();
  }

}
