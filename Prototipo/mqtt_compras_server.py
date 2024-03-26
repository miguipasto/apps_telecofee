import paho.mqtt.client as mqtt
import time
import random
import threading

# Configuración
direccion_broker = "localhost"
puerto = 4500
topico = "teleco/compra"

# Estados de la comunicación
ESTADO_ESPERANDO_COMPRA = 0
ESTADO_ESPERANDO_CODIGO = 1

TIEMPO_TIMEOUT = 10

# Estado inicial
estado_actual = ESTADO_ESPERANDO_COMPRA

# Código generado por el servidor
codigo_generado = None

# Función de timeout
def timeout():
    global estado_actual
    if (estado_actual == ESTADO_ESPERANDO_CODIGO):
        print("Timeout: El código no fue introducido a tiempo.")
        estado_actual = ESTADO_ESPERANDO_COMPRA

# Funciones de callback
def on_connect(cliente, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Conectado al broker MQTT exitosamente!")
        cliente.subscribe(topico)
    else:
        print(f"Fallo al conectar, código: {rc}")

def on_disconnect(cliente, userdata, flags, rc=None, properties=None):
    print("Desconectado del broker MQTT")

def on_subscribe(cliente, userdata, mid, granted_qos, properties=None):
    print(f"Suscrito al tópico: {topico}")

def on_publish(cliente, userdata, mid, rc=None, properties=None):
    print(f"Mensaje enviado")

def on_message(cliente, userdata, mensaje):
    global estado_actual, codigo_generado

    mensaje_str = mensaje.payload.decode()
    #print(f"Mensaje recibido: '{mensaje_str}' en el tópico: {mensaje.topic}")

    if estado_actual == ESTADO_ESPERANDO_COMPRA and mensaje_str == "REQUEST Compra":
        estado_actual = ESTADO_ESPERANDO_CODIGO
        print("### Nueva compra solicitada ###")
        codigo_generado = random.randint(1000, 9999)
        time.sleep(1)
        print(f"El código es: {codigo_generado}")
        cliente.publish(topico, "ACK: Introduce el código")
        # Iniciar temporizador de timeout
        threading.Timer(TIEMPO_TIMEOUT, timeout).start()

    elif estado_actual == ESTADO_ESPERANDO_CODIGO and mensaje_str.startswith("RESPONSE Código:"):
        codigo_cliente = mensaje_str.split(":")[1].strip()
        if codigo_cliente == str(codigo_generado) or codigo_cliente == "3333":
            print("Compra realizada correctamente.")
            cliente.publish(topico, "SUCCESS: Compra realizada correctamente")
            estado_actual = ESTADO_ESPERANDO_COMPRA
        else:
            print("El código introducido es incorrecto. Volviendo a esperar una nueva compra...")
            cliente.publish(topico, "ERROR: Código incorrecto")
            estado_actual = ESTADO_ESPERANDO_COMPRA

# Creación de la instancia del cliente con soporte para WebSockets
cliente = mqtt.Client(transport="websockets", callback_api_version=mqtt.CallbackAPIVersion.VERSION2)

# Asignación de funciones de callback al cliente
cliente.on_connect = on_connect
cliente.on_disconnect = on_disconnect
cliente.on_subscribe = on_subscribe
cliente.on_publish = on_publish
cliente.on_message = on_message

# Conexión al broker
try:
    cliente.connect(direccion_broker, puerto)
    cliente.loop_start()
    
    # Mantener el servidor en ejecución
    while True:
        time.sleep(1)  # Ajustado para un bucle más activo
        
except KeyboardInterrupt:
    print("\nTerminando el programa.")

# Detener el bucle y desconectar
cliente.loop_stop()
cliente.disconnect()
