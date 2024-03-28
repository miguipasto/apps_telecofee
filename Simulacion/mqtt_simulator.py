import firebase_admin
import time
import json
from datetime import datetime
import time
import paho.mqtt.client as mqtt
from firebase_admin import credentials, firestore

### SINCRONIZACIÓN ###
# Obtenemos las credenciales
credenciales_cliente = credentials.Certificate('./lpro-e1d36-firebase-adminsdk-qvco3-f1151578a9.json')
credenciales_workers = credentials.Certificate('./lpro-workers-firebase-adminsdk-yf4f8-595b4803e9.json')

# Inicializamos las aplicaciones con sus credenciales
app_clientes = firebase_admin.initialize_app(credenciales_cliente, name='clientes')
app_workers = firebase_admin.initialize_app(credenciales_workers, name='workers')

# Inicializamos las instancias de Firestore
db_clientes = firestore.client(app_clientes)
db_workers = firestore.client(app_workers)

# Definimos las variables iniciales
maquinas = ["minas", "industriales", "teleco", "biologia"]
niveles = [{'maquina': maquina, "fecha": "", "niveles": []} for maquina in maquinas]
compras = [{'maquina': maquina, "compras": []} for maquina in maquinas]

compras_ids = set()

niveles_maximos = {"nivel_cafe_gr": 100, "nivel_leche_ml": 200, "nivel_agua_ml": 200, "patatillas_u": 10}

def obtener_historial_reposiciones(db, nombre_maquina):
    print("##########################################################")
    print("Actualizando niveles desde el historial de reposiciones...")
    print("##########################################################\n")

    for nivel_maquina in niveles:
        if (nivel_maquina['maquina'] == nombre_maquina):
            maquina = nivel_maquina['maquina']
            path = f'niveles/{maquina}/historial_reposiciones'
            documentos = db.collection(path).order_by('fecha', direction=firestore.Query.DESCENDING).limit(1).get()
            
            for documento in documentos:
                datos_reposicion = documento.to_dict()
                nivel_maquina['niveles'] = datos_reposicion['niveles']
                nivel_maquina['fecha'] = datos_reposicion['fecha']
                print(f"Última reposición en '{maquina}': {datos_reposicion['fecha']} - Niveles: {datos_reposicion['niveles']}")

            break

def obtener_datos(db):
    print("\nConsultando nuevas compras...")
    
    compras_ref = db.collection_group("compras")
    compras_snapshot = compras_ref.get()

    if not compras_snapshot:
        print("No se encontraron nuevas compras.")
        return

    for doc in compras_snapshot:
        compra_data = doc.to_dict()
        compra_id = doc.id

        if compra_id not in compras_ids:
            compras_ids.add(compra_id)
            #print(f"Nueva compra registrada: {compra_data}")

            for maquina_compras in compras:
                if maquina_compras['maquina'] == compra_data['maquina']:
                    maquina_compras['compras'].append(compra_data)
                    actualizar_nivel(compra_data)
                    break

def actualizar_nivel(compra_data):
    for maquina_nivel in niveles:
        if maquina_nivel['maquina'] == compra_data['maquina'] and compra_data['fecha'] > maquina_nivel['fecha']:
            nivel_actual = maquina_nivel['niveles']
            obtener_nuevo_nivel(compra_data['producto'], nivel_actual)
            print(f"Niveles actualizados para '{compra_data['maquina']}': {nivel_actual}")
            break

def obtener_nuevo_nivel(producto, nivel_actual):
    # Esta función actualiza los niveles basándose en el producto comprado
    if producto == 'Café con leche':
        nivel_actual['nivel_leche_ml'] = nivel_actual.get('nivel_leche_ml') - 10
        nivel_actual['nivel_leche_pr'] = (nivel_actual.get('nivel_leche_ml')*100) / niveles_maximos.get('nivel_leche_ml')

        nivel_actual['nivel_cafe_gr'] = nivel_actual.get('nivel_cafe_gr') - 5
        nivel_actual['nivel_cafe_pr'] = (nivel_actual.get('nivel_cafe_gr')*100) / niveles_maximos.get('nivel_cafe_gr')
    elif producto == 'Café americano':
        nivel_actual['nivel_agua_ml'] = nivel_actual.get('nivel_agua_ml') - 10
        nivel_actual['nivel_agua_pr'] = (nivel_actual.get('nivel_agua_ml')*100) / niveles_maximos.get('nivel_agua_ml')

        nivel_actual['nivel_cafe_gr'] = nivel_actual.get('nivel_cafe_gr') - 5
        nivel_actual['nivel_cafe_pr'] = (nivel_actual.get('nivel_cafe_gr')*100) / niveles_maximos.get('nivel_cafe_gr')
    elif producto == 'Patatillas':
        nivel_actual['patatillas_u'] = nivel_actual.get('patatillas_u') - 1
        nivel_actual['patatillas_pr'] = (nivel_actual.get('patatillas_u')*100) / niveles_maximos.get('patatillas_u')

### PUBLICACIÓN MQTT ###
# Configuración
direccion_broker = "localhost"
puerto = 4500

# Funciones de callback
def on_connect(cliente, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Conectado al broker MQTT exitosamente!\n")
        # Nos suscribimos al topico para compras
        for maquina in maquinas:
            topico = f"{maquina}/compra"
            cliente.subscribe(topico)
            print(f"Suscrito en el tópico {topico}")
        # Nos suscribismos al topico para las reposiciones
        cliente.subscribe('reposicion')
    else:
        print(f"Fallo al conectar, código: {rc}")

def on_disconnect(cliente, userdata, flags, rc=None, properties=None):
    print("Desconectado del broker MQTT")

def on_publish(cliente, userdata, mid, rc=None, properties=None):
    print(f"Mensaje publicado en MQTT con ID: {mid}\n")

def on_message(cliente, userdata, mensaje):
    mensaje_str = mensaje.payload.decode()
    #print(f"Mensaje recibido: '{mensaje_str}' en el tópico: {mensaje.topic}")~
    if mensaje_str.startswith("SUCCESS"):
        time.sleep(5)
        obtener_datos(db_clientes)
    if mensaje.topic == "reposicion":
        print("### NUEVA REPOSICION ###")
        time.sleep(2)
        obtener_historial_reposiciones(db_workers,mensaje_str)

# Creación de la instancia del cliente
cliente = mqtt.Client(transport="websockets", callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
cliente.on_connect = on_connect
cliente.on_disconnect = on_disconnect
cliente.on_publish = on_publish
cliente.on_message = on_message

# Conexión al broker
try:
    cliente.connect(direccion_broker, puerto)
except Exception as e:
    print(f"Fallo al conectar: {e}")

############ MAIN  ############
# Creamos la conexión MQTT
cliente.loop_start()

# Obtenemos los niveles
for maquina in maquinas:
    obtener_historial_reposiciones(db_workers, maquina)
obtener_datos(db_clientes)

try:
    while True:

        # Publicación MQTT
        for maquina_nivel in niveles:
            # Crea una copia del diccionario antes de modificarlo
            maquina_sin_fecha = maquina_nivel.copy()

            maquina_sin_fecha.pop('fecha', None)
            
            mensaje = json.dumps(maquina_sin_fecha)
            print(mensaje)
            cliente.publish(f"{maquina_sin_fecha['maquina']}/nivel", mensaje)
            time.sleep(1)

        time.sleep(5)
except KeyboardInterrupt:
    print("\nTerminando el programa.")

# Detener el bucle y desconectar
cliente.loop_stop()
cliente.disconnect()

