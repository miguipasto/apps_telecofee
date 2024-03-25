import paho.mqtt.client as mqtt
import time
import json
import firebase_admin
import datetime
from firebase_admin import credentials, firestore

# Configuración MQTT
direccion_broker = "localhost"
puerto = 4500
maquinas = ["minas", "industriales", "teleco", "biologia"]
mensajes_recibidos = {}

# Configuración Firebase
credenciales_workers = credentials.Certificate('./lpro-workers-firebase-adminsdk-yf4f8-595b4803e9.json')
app_workers = firebase_admin.initialize_app(credenciales_workers, name='workers')
db_workers = firestore.client(app_workers)

# Funciones de callback
def on_connect(cliente, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Conectado al broker MQTT exitosamente!\n")
        for maquina in maquinas:
            topico = f"{maquina}/nivel"
            cliente.subscribe(topico)
            print(f"Suscrito en el tópico {topico}")
    else:
        print(f"Fallo al conectar, código: {rc}")

def on_disconnect(cliente, userdata, flags, rc=None, properties=None):
    print("Desconectado del broker MQTT")

def on_message(cliente, userdata, message, properties=None):
    if message.topic not in mensajes_recibidos:
        print(f"Primer mensaje recibido en el tópico {message.topic}")
        try:
            datos = json.loads(message.payload)
            mensajes_recibidos[message.topic] = datos
            # Desuscribirse del tópico después de recibir el primer mensaje
            cliente.unsubscribe(message.topic)
            print(f"Desuscrito del tópico {message.topic}")
            
            # Si se han recibido mensajes de todos los tópicos, imprimirlos y terminar
            if len(mensajes_recibidos) == len(maquinas):
                print("\nTodos los mensajes recibidos")
                nuevo_nivel() # Subimos los niveles a Firebase
                cliente.disconnect()
                
        except Exception as e:
            print(f"Error al procesar el mensaje: {e}")

def nuevo_nivel():
    for topico, datos in mensajes_recibidos.items():
        print(f"{topico}: {datos}")
        
        # Genera un ID único basado en la fecha y hora actual
        fecha = datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        print(fecha)
        
        # Ruta de destino
        maquina_id = datos['maquina']  
        path_destino = f'niveles/{maquina_id}/historial_niveles'
        
        # Crea el nuevo documento en la colección destino con ID basado en la fecha
        doc_ref = db_workers.collection(path_destino).document(fecha)
        doc_ref.set(datos)
        
        # Opcional: Imprime información de la operación
        print(f"Document '{fecha}' uploaded to '{path_destino}'")


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

# Creamos la conexión MQTT
cliente.loop_forever()
