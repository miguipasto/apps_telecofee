#include <Ping.h>

int entrada = 10;

int estado = 0;

const int sensor1 = 4;
const int sensor2 = 5;

double distancia1, distancia2;


Ping ping1 = Ping(sensor1);
Ping ping2 = Ping(sensor2);

void setup() {
  Serial.begin(115200);
  pinMode(entrada,INPUT);
  

}

void loop() {
  
  
  estado = digitalRead(entrada);
  ping1.fire();
  distancia1 = ping1.centimeters();
  ping2.fire();
  distancia2 = ping2.centimeters();

  if (distancia1 < 300 ||distancia2 < 300){
    Serial.print(distancia1);
    Serial.println(" cm");
    Serial.print(distancia2);
    Serial.println(" cm");
  }
  if(estado == HIGH){
    
    Serial.println("1");
    while(estado == HIGH){  
      estado = digitalRead(entrada);
    }
    

  }

  delay(500);
    
  
    
}
