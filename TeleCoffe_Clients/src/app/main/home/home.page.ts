import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { MqttPrototipoService } from 'src/app/services/mqtt-prototipo.service';
import { MqttServerService } from 'src/app/services/mqtt-server.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isLoading = true;

  isOverlayVisibleAzucar: boolean = false;
  isOVerlayVisible: boolean = false;
  isOverlayCompra: boolean = false;
  codigoConfirmacion: number | null = null;
  amountToAdd = 0;
  productoSeleccionado: any = [];
  maquinaSeleccionada: String = "teleco"
  mqttClient: any = this.mqttPrototipoService;

  private subscription: Subscription | undefined;
  public receiveNews = '';
  public isConnection = false;

  constructor(
    private dataService: DataService,
    private mqttPrototipoService: MqttPrototipoService,
    private mqttServerService: MqttServerService,
    public alertController: AlertController) { }

  ngOnInit() {
    this.subscribeToTopic(this.maquinaSeleccionada);
    this.setTimeoutForLoading(15000); //MS
  }

  selectedCategory: string = 'cafe'; // Valor inicial para mostrar algo al inicio
  products: any = {
    cafe: [
      { name: 'Café con leche', price: '1.35', img: '../../assets/cafe_con_leche.jpg', available: true },
      { name: 'Café americano', price: '1.15', img: '../../assets/cafe_americano.png', available: true }
    ],
    aperitivos: [
      { name: 'Patatillas', price: '0.85', img: '../../assets/patatillas.png', available: true }
    ],
    bebidas: [
      { name: 'Leche', price: '0.80', img: '../../assets/leche.png', available: true }
    ]
  };

  onMaquinaSeleccionada() {
    if (this.maquinaSeleccionada === 'teleco') {
      this.mqttClient = this.mqttPrototipoService;
    } else {
      this.mqttClient = this.mqttServerService;
    }
    this.setTimeoutForLoading(15000); //MS
    this.subscribeToTopic(this.maquinaSeleccionada);
    
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  showOverlay(producto: any) {
    this.productoSeleccionado = producto;
    if (producto.name == "Café con leche" || producto.name == "Café americano") {
      this.isOverlayVisibleAzucar = true;
    } else {
      this.isOVerlayVisible = true;
    }
  }

  closeOverlay() {
    this.isOverlayVisibleAzucar = false;
    this.isOVerlayVisible = false;
    this.isOverlayCompra = false;
  }

  addBalance() {
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

  async comprar(producto: any) {
    const compra = { "producto": producto.name, "precio": producto.price, "fecha": new Date(), "maquina": this.maquinaSeleccionada };

    this.amountToAdd = 0;
    this.closeOverlay();

    const datosUser: any = await this.dataService.obetenerDatosUsuario();
    if (datosUser.saldo < compra.precio) {
      this.presentAlert("Error en la compra", "No se ha podido hacer la solicitud de compra, revise su saldo.")
    } else {
      console.log("Saldo suficiente")
      try {
        const procesar_compra = await this.compraMqtt();
        if (procesar_compra) {
          this.dataService.crearCompra(compra)
            .then((response: any) => {
              this.isLoading = false;
            })
            .catch((error) => {
              console.error("Error al crear la compra:", error);
              this.presentAlert("Error realizando la compra", "Error al realizar la compra, disculpe las molestias e inténtelo de nuevo")
            });
        }
      } catch (error) {
        console.error("Error al procesar la compra MQTT:", error);
      }
    }
  }


  compraMqtt() {
    console.log("MQTT Compra");

    return new Promise((resolve, reject) => {
      // Primero, nos suscribimos al tópico de compra
      const subscription = this.mqttClient.observe(`${this.maquinaSeleccionada}/compra`).subscribe({
        next: (message: IMqttMessage) => {
          const mensaje = message.payload.toString();

          // Manejamos los mensajes
          if (mensaje.includes("NACK")) {
            this.isLoading = false;
            this.presentAlert("Compra denegada", "Otra compra está en curso, inténtelo más tarde.")
          } else if (mensaje.includes("ACK")) {
            this.isLoading = false;
            this.isOverlayCompra = true;
          } else if (mensaje.includes("SUCCESS")) {
            //console.log(mensaje)
            this.presentAlert("Código correcto!", "Espere mientres se procesa su compra\n ¡Gracias!")
            subscription.unsubscribe();
            resolve(true);
          } else if (mensaje.includes("ERROR")) {
            this.isLoading = false;
            //console.log(mensaje)
            this.presentAlert("Código incorrecto", "El código introducido es incorrecto, inténtelo de nuevo.")
            subscription.unsubscribe();
            resolve(false);
          }
        },
        error: (error: any) => {
          console.error("Connection error:", error);
          reject(error);
        }
      });

      // Solicitamos realizar una compra
      this.mqttClient.publish(`${this.maquinaSeleccionada}/compra`, 'REQUEST Compra').subscribe({
        next: () => console.log("REQUEST Compra"),
        error: (error: any) => {
          console.error("Error al publicar mensaje:", error);
          reject(error);
        }
      });
      this.isLoading = true;
    });
  }

  async presentAlert(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: header,
      message: mensaje,
      buttons: ['OK'],
    });

    await alert.present();
  }

  enviarCodigo() {
    this.mqttClient.publish(`${this.maquinaSeleccionada}/compra`, `RESPONSE Código:${this.codigoConfirmacion}`).subscribe({
      next: () => console.log(`RESPONSE Código:${this.codigoConfirmacion}`),
      error: (error: any) => {
        console.error("Error al publicar mensaje:", error);
      }
    });
    this.codigoConfirmacion = null;
    this.closeOverlay();
    this.isLoading = true;
  }


  private subscribeToTopic(maquina: String) {
    this.isConnection = true;
    const topic = `${this.maquinaSeleccionada}/nivel`;

    // Primero, verifica si ya hay una suscripción y desuscríbete
    if (this.subscription) {
      this.subscription.unsubscribe();
      console.log('Desuscripto del tópico anterior.');
      //this.isLoading = true;
    }

    // Intentamos suscribirnos al tópico
    this.subscription = this.mqttClient.observe(topic).subscribe({
      next: (message: IMqttMessage) => {
        this.isLoading = false;
        this.receiveNews += message.payload.toString() + '\n';
        this.checkAvailableProducto(message.payload.toString());
      },
      error: (error: any) => {
        this.isConnection = false;
        console.error(`Connection error: ${error}`);
      }
    });
  }

  checkAvailableProducto(data: string) {
    let jsonData = JSON.parse(data);
    console.log(jsonData);

    // Café con leche
    if (jsonData.niveles.nivel_leche_pr >= 5 && jsonData.niveles.nivel_cafe_pr >= 5) {
      this.products.cafe[0].available = true;
    } else {
      this.products.cafe[0].available = false;
    }

    // Café americano
    if (jsonData.niveles.nivel_leche_pr >= 5 && jsonData.niveles.nivel_cafe_pr >= 10) {
      this.products.cafe[1].available = true;
    } else {
      this.products.cafe[1].available = false;
    }

    // Patatillas
    if (jsonData.niveles.patatillas_u >= 1) {
      this.products.aperitivos[0].available = true;
    } else {
      this.products.aperitivos[0].available = false;
    }

    // Leche
    if (jsonData.niveles.nivel_leche_pr >= 10) {
      this.products.bebidas[0].available = true;
    } else {
      this.products.bebidas[0].available = false;
    }

  }

  private setTimeoutForLoading(time: any) {
    const timeoutDuration = time;

    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.presentAlert('Timeout', 'No se ha podido conectar con la máquina solicitada, por favor inténtelo de nuevo.');
      }
    }, timeoutDuration);
  }

}