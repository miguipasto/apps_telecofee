#include <DFRobot_GDL.h>

#define TFT_CS 10
#define TFT_RST 9
#define TFT_DC 8
#define TFT_BL 4

#define MAX_STRING_LENGTH 50

char receivedChars[MAX_STRING_LENGTH];
boolean newData = false;

DFRobot_ILI9488_320x480_HW_SPI screen(TFT_DC, TFT_CS, TFT_RST);

void setup() {
  Serial.begin(115200);
  screen.begin();
  screen.fillScreen(COLOR_RGB565_BLACK);
  showInitialScreen();
}

void loop() {
  receiveSerialData();
  if (newData) {
    displayReceivedData();
  }
}


void receiveSerialData() {
    static byte ndx = 0;
    char endMarker = ';';
    char rc;

    while (Serial.available() > 0) {
        rc = Serial.read();
        Serial.print(rc); // Imprime cada carácter recibido para depuración.
        
        if (rc != endMarker) {
            receivedChars[ndx] = rc;
            ndx++;
            if (ndx >= MAX_STRING_LENGTH) {
                ndx = MAX_STRING_LENGTH - 1; // Previene desbordamiento de buffer.
            }
        } else {
            receivedChars[ndx] = '\0'; // Asegura la terminación de la cadena.
            ndx = 0;
            newData = true;
            break; // Sale del bucle una vez que el mensaje completo ha sido recibido.
        }
    }
}


void clearReceivedChars() {
    for (int i = 0; i < MAX_STRING_LENGTH; i++) {
        receivedChars[i] = '\0'; 
    }
    newData = false;
}

void displayReceivedData() {

  // Limpiar datos recibidos (trimming)
  String data = String(receivedChars);
  data.trim(); // Elimina espacios en blanco al inicio y al final

  if (data.startsWith("1,")) {
    String code = data.substring(2);
    Serial.println("Mostrando código: " + code); // Debug
    showCodeScreen(code);
  } else if (data.startsWith("2")) {
    showWelcomeMessage();
  } else if (data.startsWith("3")) {
    showProcessing();
  } else if (data.startsWith("4")) {
    showTake();
  } else {
    Serial.println("Formato de mensaje no reconocido.");
  }

  clearReceivedChars(); 
}

void clearScreen() {
  screen.fillRect(0, 0, 320, 280, COLOR_RGB565_BLACK);
  Serial.println("Se ha limpiado la pantalla");
}

void showCodeScreen(String code) {
  clearScreen();
  
  // Inicializamos vacio para poder tabular
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("");

  // Mostramos Intro, parte 1
  screen.setCursor(50, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("Introduzca el");

  // Mostramos Intro, parte 2
  screen.setCursor(20, 90);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("siguiente codigo");

  // Mostramos Intro, parte 3
  screen.setCursor(75, 120);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("en la app:");
  
  // Mostramos Código
  screen.setCursor(130, 165);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println(code);
}


void showWelcomeMessage() {
  clearScreen();
  // Inicializamos vacio para poder tabular
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("");

  // Mostramos Intro, parte 1
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("¡ BIENVENIDO !");

  // Mostramos Intro, parte 2
  screen.setCursor(40, 120);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("Esperando su");

  // Mostramos Intro, parte 3
  screen.setCursor(100, 150);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("pedido");
}

void showProcessing() {
  clearScreen();
  // Inicializamos vacio para poder tabular
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("");

  // Mostramos Intro, parte 1
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("Codigo correcto");

  // Mostramos Intro, parte 2
  screen.setCursor(40, 120);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("Dispensando su");

  // Mostramos Intro, parte 3
  screen.setCursor(100, 150);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("pedido");
}

void showTake() {
  clearScreen();
  // Inicializamos vacio para poder tabular
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("");

  // Mostramos Intro, parte 1
  screen.setCursor(30, 60);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("¡ Gracias !");

  // Mostramos Intro, parte 2
  screen.setCursor(60, 120);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("Recoja su");

  // Mostramos Intro, parte 3
  screen.setCursor(100, 150);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3);
  screen.println("pedido");
}


void showInitialScreen() {
  screen.setCursor(0, 280);
  screen.setTextColor(COLOR_RGB565_WHITE);
  screen.setTextSize(3); 
  screen.print("");   

  screen.setCursor(80, 300);
  screen.setTextColor(COLOR_RGB565_WHITE);

  screen.setTextSize(3);
  screen.print("TeleCoffee "); 

  //ASA
  screen.drawCircle(180,410,13,COLOR_RGB565_WHITE);
  screen.fillCircle(180,410,13,COLOR_RGB565_WHITE);
  screen.drawCircle(180,410,8,COLOR_RGB565_BLACK);
  screen.fillCircle(180,410,8,COLOR_RGB565_BLACK);    

  //PLATO + TAZA
  screen.drawRect(125,430,70,5,COLOR_RGB565_LGRAY);
  screen.fillRect(125,430,70,5,COLOR_RGB565_LGRAY);
  screen.drawRoundRect(130,435,60,3,3,COLOR_RGB565_LGRAY);
  screen.fillRoundRect(130,435,60,3,3,COLOR_RGB565_LGRAY);   
  screen.drawRect(140,390,40,40,COLOR_RGB565_WHITE);
  screen.fillRect(140,390,40,40,COLOR_RGB565_WHITE);

  //HUMO
  screen.drawRoundRect(145,365,5,15,3,COLOR_RGB565_LGRAY);
  screen.fillRoundRect(145,365,5,15,3,COLOR_RGB565_LGRAY); 
  screen.drawCircle(141,368,5,COLOR_RGB565_BLACK);
  screen.fillCircle(141,368,5,COLOR_RGB565_BLACK);  
  screen.drawCircle(153,374,5,COLOR_RGB565_BLACK);
  screen.fillCircle(153,374,5,COLOR_RGB565_BLACK);   

  screen.drawRoundRect(160,365,5,15,3,COLOR_RGB565_LGRAY);
  screen.fillRoundRect(160,365,5,15,3,COLOR_RGB565_LGRAY); 
  screen.drawCircle(156,368,5,COLOR_RGB565_BLACK);
  screen.fillCircle(156,368,5,COLOR_RGB565_BLACK);  
  screen.drawCircle(168,374,5,COLOR_RGB565_BLACK);
  screen.fillCircle(168,374,5,COLOR_RGB565_BLACK);

  screen.drawRoundRect(173,365,5,15,3,COLOR_RGB565_LGRAY);
  screen.fillRoundRect(173,365,5,15,3,COLOR_RGB565_LGRAY); 
  screen.drawCircle(169,368,5,COLOR_RGB565_BLACK);
  screen.fillCircle(169,368,5,COLOR_RGB565_BLACK);  
  screen.drawCircle(181,374,5,COLOR_RGB565_BLACK);
  screen.fillCircle(181,374,5,COLOR_RGB565_BLACK); 

  //TC
  screen.setCursor(0, 400);
  screen.setTextColor(COLOR_RGB565_BLACK);
  screen.setTextSize(2); 
  screen.print("");   

  screen.setCursor(149, 405);
  screen.setTextColor(COLOR_RGB565_BLACK);
  screen.setTextSize(2); 
  screen.print("TC");  


  delay(3000);
}

