#include <Ping.h>

const int sensor = 4;

double distancia;
float distancia_med;
int contador = 0;

Ping ping = Ping(sensor);

void setup(){
  Serial.begin(9600);
}

void loop(){
  ping.fire();
  distancia = ping.centimeters();

    Serial.print(distancia);
    Serial.println(" cm");




  //delay(500);
}