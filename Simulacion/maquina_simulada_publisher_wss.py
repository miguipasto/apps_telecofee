import paho.mqtt.client as mqtt
import time
import json

# Configuración
direccion_broker = "192.168.1.124"
puerto = 4500
topico_nivel = "teleco/nivel"

# Niveles iniciales
niveles = {
    "nombre": "prototipo",
    "nivel_leche_ml": 200,
    "nivel_leche_pr": 100,
    "nivel_cafe_gr": 100,
    "nivel_cafe_pr": 100,
    "patatillas": 10
}

# Funciones de callback
def on_connect(cliente, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Conectado al broker MQTT exitosamente!")
        cliente.subscribe(topico_nivel)
    else:
        print(f"Fallo al conectar, código: {rc}")

def on_disconnect(cliente, userdata, flags, rc=None, properties=None):
    print("Desconectado del broker MQTT")

def on_publish(cliente, userdata, mid, rc=None, properties=None):
    print(f"Mensaje publicado con ID: {mid}")

def on_message(cliente, userdata, message, properties=None):
    print(f"Mensaje recibido en el tópico {message.topic}")
    try:
        datos = json.loads(message.payload)
        print(datos)
    except Exception as e:
        print(f"Error al procesar el mensaje: {e}")

# Creación de la instancia del cliente
cliente = mqtt.Client(transport="websockets", callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
cliente.on_connect = on_connect
cliente.on_disconnect = on_disconnect
cliente.on_message = on_message

# Conexión al broker
try:
    cliente.connect(direccion_broker, puerto)
except Exception as e:
    print(f"Fallo al conectar: {e}")

# Inicio del bucle
cliente.loop_start()

try:
    while True:
        time.sleep(2)
except KeyboardInterrupt:
    print("\nTerminando el programa.")

# Detener el bucle y desconectar
cliente.loop_stop()
cliente.disconnect()
