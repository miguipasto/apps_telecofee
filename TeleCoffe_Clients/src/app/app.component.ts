import { Component, OnInit } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private subscription: Subscription | undefined;
  public receiveNews = '';
  public isConnection = false;
  private readonly topic = 'test/topico';

  constructor(private mqttService: MqttService) {}

  ngOnInit(): void {
    this.subscribeToTopic();
  }

  private subscribeToTopic() {
    this.isConnection = true; // Asumimos conexión inicialmente

    // Intentamos suscribirnos al tópico
    this.subscription = this.mqttService.observe(this.topic).subscribe({
      next: (message: IMqttMessage) => {
        this.receiveNews += message.payload.toString() + '\n';
        console.log(`Received message: ${message.payload.toString()} from topic: ${this.topic}`);
      },
      error: (error: any) => {
        this.isConnection = false;
        console.error(`Connection error: ${error}`);
      }
    });

    // Manejar eventos de conexión y error a nivel de servicio
    this.mqttService.onConnect.subscribe(() => {
      console.log('Connected to MQTT broker.');
    });

    this.mqttService.onError.subscribe(error => {
      this.isConnection = false;
      console.error('Connection error:', error);
    });
  }

  ngOnDestroy() {
    // Asegúrate de desuscribirte cuando el componente se destruya
    this.subscription?.unsubscribe();
  }
}
