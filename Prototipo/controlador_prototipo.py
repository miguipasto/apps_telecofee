import serial
import time
import json
import random
import threading
import paho.mqtt.client as mqtt

# Configuraciones de hardware
arduino_sensores = serial.Serial(port='/dev/ttyACM0', baudrate=57600, timeout=1)
arduino_pantalla = serial.Serial(port='/dev/ttyACM1', baudrate=115200, timeout=1)

# Configuraciones de los niveles de productos
niveles_maximos = {
    "nivel_cafe_gr": 150,
    "nivel_leche_ml": 1500,
    "nivel_agua_ml": 1500,
    "patatillas_u": 15
}

niveles = {
    "maquina": "teleco",
    "niveles": {
        "nivel_cafe_gr": 0, "nivel_cafe_pr": 0,
        "nivel_leche_ml": 0, "nivel_leche_pr": 0,
        "nivel_agua_ml": 0, "nivel_agua_pr": 0,
        "patatillas_u": 15, "patatillas_pr": 100
    }
}

# Configuraciones MQTT
MQTT_BROKER_ADDRESS = "localhost"
MQTT_PORT = 4500
MQTT_TRANSPORT = "websockets"
MQTT_API_VERSION = mqtt.CallbackAPIVersion.VERSION2
cliente = None

# Estados de la máquina
estado_maquina = 0
codigo_actual = 0
tiempo_timeout = 60

# Mensajes de interacción
MENSAJE_COMPRA_REQUEST = "REQUEST Compra"
MENSAJE_ACK_CODIGO = "ACK: Introduce el código"
MENSAJE_NACK_CODIGO = "NACK: Hay otra compra en curso"
MENSAJE_SUCCESS_COMPRA = "SUCCESS: Compra realizada correctamente"
MENSAJE_ERROR_CODIGO = "ERROR: Código incorrecto"
CODIGO_MASTER = "3333"

def convert_cm_to_ml(distance_measured, width=12, length=17.5, height=7.14):
    distancia_ajuste = 4.81
    nivel_ml = 0

    if (distance_measured > 0):
        liquid_height = (height - distance_measured) + distancia_ajuste
        nivel_ml = round((liquid_height * width * length), 2)
        print("Nivel calculado en ml:", nivel_ml)

    if nivel_ml >= 1500:
        nivel_ml = 1500
        print("Nivel ajustado a 1500 ml debido a la capacidad máxima")

    if nivel_ml < 0:
        nivel_ml = 0
        print("Nivel ajustado a 0 ml debido a la capacidad máxima")

    return nivel_ml


def update_levels(data_dict):
    for key, sensor_key in zip(["nivel_cafe_gr", "nivel_leche_ml", "nivel_agua_ml"], ["peso_gr", "sensor_1_cm", "sensor_2_cm"]):
        if key == "nivel_leche_ml" or key == "nivel_agua_ml":
            niveles["niveles"][key] = convert_cm_to_ml(data_dict[sensor_key])
        else:
            niveles["niveles"][key] = data_dict[sensor_key]

        if key == "nivel_cafe_gr" and niveles["niveles"][key] < 0:
            niveles["niveles"][key] = 0

        niveles["niveles"][key[:-3] + "_pr"] = round((niveles["niveles"][key] / niveles_maximos[key]) * 100, 2)
    niveles["niveles"]["patatillas_pr"] = round((niveles["niveles"]["patatillas_u"] / niveles_maximos["patatillas_u"]) * 100, 2)

def product_ack():
    if niveles["niveles"]["patatillas_u"] > 0:
        niveles["niveles"]["patatillas_u"] -= 1

def send_levels():
    json_data = json.dumps(niveles)
    cliente.publish(f"teleco/nivel", json_data)
    print(json_data)

def send_to_arduino(send_str):
    send_str += ';'
    arduino_pantalla.write(send_str.encode())

def read_arduino_sensores():
    while True:
        data_bytes = arduino_sensores.readline()[:-2]
        if data_bytes:
            data_str = data_bytes.decode()
            if data_str.startswith("Fototransistor"):
                product_ack()
                send_levels()
            elif data_str.startswith("{"):
                data_dict = json.loads(data_str)
                update_levels(data_dict)
                send_levels()
            else:
                print(data_str)

# Implementación de funciones MQTT
def setup_mqtt_client():
    global cliente
    cliente = mqtt.Client(transport=MQTT_TRANSPORT, callback_api_version=MQTT_API_VERSION)
    cliente.on_connect = on_connect
    cliente.on_disconnect = on_disconnect
    cliente.on_message = on_message

    try:
        cliente.connect(MQTT_BROKER_ADDRESS, MQTT_PORT)
        cliente.loop_start()
        print("Intentando conectar con el broker MQTT...")
    except Exception as e:
        print(f"Error al intentar conectar con el broker MQTT: {e}")

def on_connect(client, userdata, flags, rc, properties=None):
    print("Conectado al broker MQTT exitosamente!")
    client.subscribe('teleco/compra')
    client.subscribe('reposicion')

def on_disconnect(client, userdata, rc=None, properties=None):
    print("Desconexión del broker MQTT completada.")

def on_message(client, userdata, message):
    gestionar_compra(message.payload.decode())

def gestionar_compra(mensaje):
    global estado_maquina, codigo_actual
    if mensaje.startswith(MENSAJE_COMPRA_REQUEST) and estado_maquina == 0:
        estado_maquina = 1
        codigo_actual = random.randint(1000, 9999)
        cliente.publish('teleco/compra', f"{MENSAJE_ACK_CODIGO}")
        send_to_arduino(f'1,{codigo_actual}')
        threading.Timer(tiempo_timeout, timeout).start()
    elif mensaje.startswith("RESPONSE") and estado_maquina == 1:
        codigo_enviado = mensaje.split(":")[1]
        if codigo_enviado == str(codigo_actual) or codigo_enviado == CODIGO_MASTER:
            send_to_arduino('3,')
            cliente.publish('teleco/compra', MENSAJE_SUCCESS_COMPRA)
            estado_maquina = 0
            time.sleep(5)
            send_to_arduino('4,')
            time.sleep(5)
            send_to_arduino('2,')
        else:
            cliente.publish('teleco/compra', MENSAJE_ERROR_CODIGO)
            send_to_arduino('2,')
    elif mensaje.startswith('teleco'):
        nivel_patatillas = mensaje.split(':')[1]
        niveles["niveles"]["patatillas_u"] = int(nivel_patatillas)

def timeout():
    global estado_maquina
    if estado_maquina == 1:
        print("Tiempo de espera excedido, cancelando compra.")
        estado_maquina = 0

if __name__ == "__main__":
    setup_mqtt_client()
    time.sleep(2)
    try:
        send_to_arduino('2,')
        read_arduino_sensores()
    except KeyboardInterrupt:
        print("\nInterrupción por el usuario. Deteniendo...")
        arduino_sensores.close()
        arduino_pantalla.close()
        print("Conexiones Serial cerradas. Programa terminado.")
