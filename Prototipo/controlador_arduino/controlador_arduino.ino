#include <Ping.h>

// Estado
int estado = 0;

// Definición de puertos
const int entrada = 10;
const int sensoresPines[] = {4, 5};
const int numSensores = sizeof(sensoresPines) / sizeof(sensoresPines[0]);

// Array para almacenar punteros a las instancias de Ping
Ping* sensores[numSensores];

double distancias[numSensores];

void setup() {
  Serial.begin(115200);
  pinMode(entrada, INPUT);
  
  // Inicializamos los objetos Ping aquí, dentro de setup(), usando memoria dinámica
  for (int i = 0; i < numSensores; i++) {
    sensores[i] = new Ping(sensoresPines[i]);
  }
}

void loop() {
  String mensaje = ""; // Inicializa el mensaje como una cadena vacía
  
  estado = digitalRead(entrada);
  
  // Leer y almacenar las distancias de cada sensor
  for (int i = 0; i < numSensores; i++) {
    sensores[i]->fire();
    distancias[i] = sensores[i]->centimeters();
    
    // Añadir los datos de cada sensor al mensaje
    mensaje += "Sensor" + String(i + 1) + ":" + String(distancias[i]) + ",";
  }

  // Condición especial para añadir el pulso al mensaje
  if (estado == HIGH) {
    mensaje += "Pulso:1"; // Añade el pulso al mensaje
    // Espera a que el estado cambie para evitar enviar múltiples veces
    while (digitalRead(entrada) == HIGH) {}
  } else {
    // Si no hay pulso, elimina la última coma del mensaje
    mensaje.remove(mensaje.length() - 1);
  }

  // Envía el mensaje completo
  Serial.println(mensaje);

  delay(500);
}
