import { Injectable } from '@angular/core';
import { MqttService, IMqttServiceOptions } from 'ngx-mqtt';

const MQTT_SERVICE_OPTIONS_2: IMqttServiceOptions = {
  hostname: 'telecoffe.duckdns.org',
  port: 443,
  path: '/prototipo/mqtt',
  protocol: 'wss', 
};

@Injectable({
  providedIn: 'root'
})
export class MqttPrototipoService extends MqttService {
  constructor() {
    super(MQTT_SERVICE_OPTIONS_2);
  }
}