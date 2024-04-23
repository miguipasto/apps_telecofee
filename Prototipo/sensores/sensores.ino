#include <Ping.h>
#include <HX711_ADC.h>

#if defined(ESP8266) || defined(ESP32) || defined(AVR)
#include <EEPROM.h>
#endif

const int sensor1 = 6;
const int sensor2 = 7;
const int fototransistor = 2;
double distancia1, distancia2;
boolean fototransistor_activo = false;

const int HX711_dout = 4;  // MCU > HX711 dout pin
const int HX711_sck = 5;   // MCU > HX711 sck pin

HX711_ADC LoadCell(HX711_dout, HX711_sck);

const int calVal_eepromAddress = 0;

Ping ping1 = Ping(sensor1);
Ping ping2 = Ping(sensor2);

void setup() {
  Serial.begin(57600);
  delay(10);
  Serial.println("Starting...");
  
  pinMode(fototransistor, INPUT);
  attachInterrupt(digitalPinToInterrupt(fototransistor), activo, RISING);
  
  LoadCell.begin();
  //calibracion = 400,01
  float calibrationValue = 696.0; // Carga el valor de calibración según sea necesario
  #if defined(ESP8266) || defined(ESP32)
  EEPROM.begin(512);
  #endif
  EEPROM.get(calVal_eepromAddress, calibrationValue);
  
  LoadCell.start(2000, true);  // Tiempo de estabilización 2000ms, tara al inicio
  if (LoadCell.getTareTimeoutFlag()) {
    Serial.println("Timeout, check MCU>HX711 wiring and pin designations");
    // while(1)
  } else {
    LoadCell.setCalFactor(calibrationValue);
    Serial.println("Startup is complete");
  }

  delay(5000);  // Retraso de estabilización inicial
}

void loop() {
  measureAndReport();
  delay(1000);
}

void measureAndReport() {
  //float peso_actual = LoadCell.getData();  // Obtiene una lectura inicial del peso
  float peso_actual = 0;
  float peso_anterior = peso_actual;       // Inicializa peso_anterior con el mismo valor para la primera comparación
  int measurementCount = 0;

  // Bucle de medición para estabilizar la lectura del peso
  while (abs(peso_actual - peso_anterior) > 0.50 || measurementCount < 5) {
    if (LoadCell.update()) {
      peso_anterior = peso_actual;         // Guarda el último peso medido
      peso_actual = LoadCell.getData();    // Actualiza el peso actual
    } 
    
    delay(500); 
    measurementCount++;
  }

  // Lecturas del sensor ultrasónico
  ping1.fire();
  distancia1 = ping1.centimeters();
  ping2.fire();
  distancia2 = ping2.centimeters();

  // Salida de datos estructurados en formato JSON
  Serial.print(F("{ \"peso_gr\": "));
  Serial.print(peso_actual);
  Serial.print(F(", \"sensor_1_cm\": "));
  Serial.print(distancia1);
  Serial.print(F(", \"sensor_2_cm\": "));
  Serial.print(distancia2);
  Serial.println(F(" }"));

  if (fototransistor_activo == true){
    fototransistor_activo = false;
    Serial.println("Fototransistor: 1");
    delay(200);

  }
}


void activo() {
  //Serial.println("Fototransistor: 1");

  fototransistor_activo = true;
}
