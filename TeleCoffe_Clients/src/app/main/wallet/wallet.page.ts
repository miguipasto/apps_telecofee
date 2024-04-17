import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

  userData: any;
  wallet: number = 0;
  nombre: string = "";
  compras: any[] = [];
  isOverlayVisible: boolean = false;
  amountToAdd: number = 0;

  constructor(private dataService: DataService, public alertController: AlertController) { }

  async ngOnInit() {
    try {
      this.userData = await this.dataService.obetenerDatosUsuario();
      if (this.userData) {
        this.wallet = parseFloat(this.userData.saldo.toFixed(2));
        this.nombre = this.userData.nombre;
      }

      let comprasRaw = await this.dataService.obtenerComprasUsuario();
      this.compras = this.ordenarComprasPorFecha(comprasRaw);
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  }

  ordenarComprasPorFecha(compras: any[]): any[] {
    return compras.sort((a, b) => b.fecha.seconds - a.fecha.seconds);
  }

  showOverlay() {
    this.isOverlayVisible = true;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
  }

  async addBalance() {
    if (isNaN(this.amountToAdd) || this.amountToAdd <= 0) {
      console.error("Cantidad a añadir no válida.");
      this.amountToAdd = 0;
      return;
    }

    console.log("Añadiendo saldo:", this.amountToAdd);
    this.wallet += this.amountToAdd;
    try {
      await this.dataService.actualizarSaldoUsuario(this.wallet);
      this.presentAlert("¡Gracias!", "Saldo añadido correctamente");
    } catch (error) {
      console.error("Error al actualizar el saldo", error);
    } finally {
      this.closeOverlay();
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

}
