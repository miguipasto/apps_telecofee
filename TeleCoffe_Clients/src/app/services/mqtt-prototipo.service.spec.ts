import { TestBed } from '@angular/core/testing';

import { MqttPrototipoService } from './mqtt-prototipo.service';

describe('MqttPrototipoService', () => {
  let service: MqttPrototipoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MqttPrototipoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
