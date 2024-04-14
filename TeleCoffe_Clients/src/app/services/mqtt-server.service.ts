import { Injectable } from '@angular/core';
import { MqttService, IMqttServiceOptions } from 'ngx-mqtt';

const MQTT_SERVICE_OPTIONS_1: IMqttServiceOptions = {
  hostname: 'telecoffe.duckdns.org',
  port: 443,
  path: '/server/mqtt',
  protocol: 'wss', 
};

@Injectable({
  providedIn: 'root'
})
export class MqttServerService extends MqttService {
  constructor() {
    super(MQTT_SERVICE_OPTIONS_1);
  }
}
