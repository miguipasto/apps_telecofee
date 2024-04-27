import paho.mqtt.client as mqtt
import firebase_admin
import json
import time
import random
import threading
import logging
from datetime import datetime
from firebase_admin import credentials, firestore

# lOGS
# Configura el nivel de logging y el formato
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    filename='mqtt_simulator.log',
                    filemode='w')

# Variables globales    
credenciales_cliente = credentials.Certificate('./lpro-e1d36-firebase-adminsdk-qvco3-f1151578a9.json')
credenciales_workers = credentials.Certificate('./lpro-workers-firebase-adminsdk-yf4f8-595b4803e9.json')

app_clientes = firebase_admin.initialize_app(credenciales_cliente, name='clientes')
app_workers = firebase_admin.initialize_app(credenciales_workers, name='workers')

db_clients = firestore.client(app_clientes)
db_workers = firestore.client(app_workers)

MQTT_BROKER_ADDRESS = "localhost"
MQTT_PORT = 4500
MQTT_TRANSPORT = "websockets"
MQTT_API_VERSION = mqtt.CallbackAPIVersion.VERSION2
cliente = None

maquinas = ["minas", "industriales", "biologia"]
niveles = [{'maquina': maquina, "fecha": "", "niveles": []} for maquina in maquinas]
compras = [{'maquina': maquina, "compras": []} for maquina in maquinas]
compras_ids = set()
niveles_maximos = {"nivel_cafe_gr": 150, "nivel_leche_ml": 1500, "nivel_agua_ml": 1500, "patatillas_u": 15}

# Estados de la comunicación
ESTADO_ESPERANDO_COMPRA = 0
ESTADO_ESPERANDO_CODIGO = 1
TIEMPO_TIMEOUT = 60

maquinas_estado = {maquina: {"estado": ESTADO_ESPERANDO_COMPRA, "codigo": None} for maquina in maquinas}

# Compras
MENSAJE_COMPRA_REQUEST = "REQUEST Compra"
MENSAJE_CODIGO_RESPONSE_PREFIX = "RESPONSE Código:"
MENSAJE_ACK_CODIGO = "ACK: Introduce el código"
MENSAJE_NACK_CODIGO = "NACK: Hay otra compra en curso"
MENSAJE_SUCCESS_COMPRA = "SUCCESS: Compra realizada correctamente"
MENSAJE_ERROR_CODIGO = "ERROR: Código incorrecto"
CODIGO_MASTER = "3333"


def setup_mqtt_client():
    global cliente
    cliente = mqtt.Client(transport=MQTT_TRANSPORT, callback_api_version=MQTT_API_VERSION)
    cliente.on_connect = on_connect
    cliente.on_disconnect = on_disconnect
    cliente.on_publish = on_publish
    cliente.on_message = on_message

    try:
        cliente.connect(MQTT_BROKER_ADDRESS, MQTT_PORT)
        cliente.loop_start()
        logging.info("Intentando conectar con el broker MQTT...")
    except Exception as e:
        logging.error(f"Error al intentar conectar con el broker MQTT: {e}")

def suscribe_to_topics():
    for maquina in maquinas:
        topico = f'{maquina}/compra'
        cliente.subscribe(topico)
        logging.info(f"Suscrito al tópico de compras: {topico}")

    topico = 'reposicion'
    cliente.subscribe(topico)
    logging.info(f"Suscrito al tópico de reposición: {topico}")

def actualizar_publicacion_mqtt():
    for maquina_nivel in niveles:
        maquina_sin_fecha = maquina_nivel.copy()
        maquina_sin_fecha.pop('fecha', None)
        mensaje = json.dumps(maquina_sin_fecha)
        logging.info(f"Publicando niveles de '{maquina_sin_fecha['maquina']}': {mensaje}")
        cliente.publish(f"{maquina_sin_fecha['maquina']}/nivel", mensaje)
        #time.sleep(1)

def on_connect(cliente, userdata, flags, rc, properties=None):
    if rc == 0:
        logging.info("Conectado al broker MQTT exitosamente!\n")
        suscribe_to_topics()
        # Obtenemos el historial de reposiciones
        for maquina in maquinas:
            obtener_historial_reposiciones(db_workers,maquina)

        # Obtenemos las compras
        obtener_compras(db_clients)
    else:
        logging.error(f"Fallo en la conexión con el broker MQTT, código de error: {rc}")

def on_disconnect(cliente, userdata, rc=None, properties=None):
    logging.info("Desconexión del broker MQTT completada.")

def on_publish(cliente, userdata, mid, rc=None, properties=None):
    logging.info("")

def on_message(cliente, userdata, message):
    mensaje = message.payload.decode()
    topico = message.topic
    #logging.info(f"Mensaje recibido en '{topico}': {mensaje_str}")

    if topico.endswith("compra"):
        gestionar_compra(mensaje,topico)
    elif topico == "reposicion":
        logging.info("NUEVA REPOSICION")
        time.sleep(2)
        obtener_historial_reposiciones(db_workers,mensaje)

def obtener_historial_reposiciones(db, nombre_maquina):
    logging.info(f"Obteniendo historial de reposiciones para la máquina: {nombre_maquina}")
    for nivel_maquina in niveles:
        if nivel_maquina['maquina'] == nombre_maquina:
            path = f'niveles/{nombre_maquina}/historial_reposiciones'
            documentos = db.collection(path).order_by('fecha', direction=firestore.Query.DESCENDING).limit(1).get()
            for documento in documentos:
                datos_reposicion = documento.to_dict()
                nivel_maquina['niveles'] = datos_reposicion['niveles']
                nivel_maquina['fecha'] = datos_reposicion['fecha']
                logging.info(f"Última reposición para '{nombre_maquina}': {datos_reposicion['fecha']} - Niveles: {datos_reposicion['niveles']}")

def obtener_compras(db):
    logging.info("Consultando compras recientes...")
    compras_ref = db.collection_group("compras")
    compras_snapshot = compras_ref.get()

    for doc in compras_snapshot:
        compra_data = doc.to_dict()
        compra_id = doc.id
        if compra_id not in compras_ids:
            compras_ids.add(compra_id)
            logging.info(f"Nueva compra detectada: {compra_data}")
            for maquina_compras in compras:
                if maquina_compras['maquina'] == compra_data['maquina']:
                    maquina_compras['compras'].append(compra_data)
                    actualizar_nivel(compra_data)

def actualizar_nivel(compra_data):
    logging.info(f"Actualizando niveles para '{compra_data['maquina']}' debido a la compra de '{compra_data['producto']}'")
    for maquina_nivel in niveles:
        if maquina_nivel['maquina'] == compra_data['maquina'] and compra_data['fecha'] > maquina_nivel['fecha']:
            obtener_nuevo_nivel(compra_data['producto'], maquina_nivel['niveles'])

def obtener_nuevo_nivel(producto, nivel_actual):
    # Esta función actualiza los niveles basándose en el producto comprado
    if producto == 'Café con leche':
        nivel_actual['nivel_leche_ml'] = nivel_actual.get('nivel_leche_ml') - 100
        nivel_actual['nivel_leche_pr'] = round((nivel_actual.get('nivel_leche_ml')*100) / niveles_maximos.get('nivel_leche_ml'), 2)

        nivel_actual['nivel_cafe_gr'] = nivel_actual.get('nivel_cafe_gr') - 5
        nivel_actual['nivel_cafe_pr'] = round((nivel_actual.get('nivel_cafe_gr')*100) / niveles_maximos.get('nivel_cafe_gr'), 2)
    elif producto == 'Café americano':
        nivel_actual['nivel_agua_ml'] = nivel_actual.get('nivel_agua_ml') - 100
        nivel_actual['nivel_agua_pr'] = round((nivel_actual.get('nivel_agua_ml')*100) / niveles_maximos.get('nivel_agua_ml'), 2)

        nivel_actual['nivel_cafe_gr'] = nivel_actual.get('nivel_cafe_gr') - 5
        nivel_actual['nivel_cafe_pr'] = round((nivel_actual.get('nivel_cafe_gr')*100) / niveles_maximos.get('nivel_cafe_gr'), 2)
    elif producto == 'Patatillas':
        nivel_actual['patatillas_u'] = nivel_actual.get('patatillas_u') - 1
        nivel_actual['patatillas_pr'] = round((nivel_actual.get('patatillas_u')*100) / niveles_maximos.get('patatillas_u'), 2)

def gestionar_compra(mensaje_str, topico):
    maquina = topico.split('/')[0]
    estado_actual = maquinas_estado[maquina]["estado"]

    if estado_actual == ESTADO_ESPERANDO_COMPRA and mensaje_str == MENSAJE_COMPRA_REQUEST:
        # Preparación para recibir el código de la compra
        preparar_compra(maquina, topico)

    elif estado_actual == ESTADO_ESPERANDO_CODIGO and mensaje_str == MENSAJE_COMPRA_REQUEST:
        # Indicamos que ya hay otra compra en curso
        logging.info(MENSAJE_NACK_CODIGO)
        cliente.publish(topico,MENSAJE_NACK_CODIGO)

    elif estado_actual == ESTADO_ESPERANDO_CODIGO and mensaje_str.startswith(MENSAJE_CODIGO_RESPONSE_PREFIX):
        # Verificación del código de la compra
        codigo_cliente = mensaje_str.split(":")[1].strip()
        verificar_codigo_compra(maquina, topico, codigo_cliente)

    elif mensaje_str.startswith(MENSAJE_SUCCESS_COMPRA):
        time.sleep(10)
        obtener_compras(db_clients)

def preparar_compra(maquina, topico):
    maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_CODIGO
    logging.info(f"Nueva compra solicitada en {maquina}")

    codigo_generado = random.randint(1000, 9999)
    maquinas_estado[maquina]["codigo"] = codigo_generado

    time.sleep(1)  # Simula un breve retardo

    logging.info(f"{topico}: El código para {maquina} es: {codigo_generado}")
    cliente.publish(topico, MENSAJE_ACK_CODIGO)

    # Inicia el temporizador de timeout para esta máquina
    threading.Timer(TIEMPO_TIMEOUT, timeout, args=(maquina,)).start()

def verificar_codigo_compra(maquina, topico, codigo_cliente):
    codigo_correcto = maquinas_estado[maquina]["codigo"]
    if codigo_cliente == str(codigo_correcto) or codigo_cliente == CODIGO_MASTER:
        logging.info(f"Compra realizada correctamente en {maquina}.")
        cliente.publish(topico, MENSAJE_SUCCESS_COMPRA)
        maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_COMPRA
    else:
        logging.info(f"El código introducido es incorrecto en {maquina}. Volviendo a esperar una nueva compra...")
        cliente.publish(topico, MENSAJE_ERROR_CODIGO)
        maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_COMPRA

def timeout(maquina):
    if maquinas_estado[maquina]["estado"] == ESTADO_ESPERANDO_CODIGO:
        logging.info(f"Timeout para {maquina}: El código no fue introducido a tiempo.")
        maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_COMPRA


def main():
    setup_mqtt_client()
    time.sleep(3) 
    logging.info('SETUP Completed')
    try:
        while True:
            actualizar_publicacion_mqtt()
            time.sleep(2) 
    except KeyboardInterrupt:
        logging.error("Deteniendo el sistema por solicitud del usuario.")
        cliente.loop_stop()
        cliente.disconnect()

if __name__ == "__main__":
    main()