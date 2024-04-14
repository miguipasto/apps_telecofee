import { TestBed } from '@angular/core/testing';

import { MqttServerService } from './mqtt-server.service';

describe('MqttServerService', () => {
  let service: MqttServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MqttServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
