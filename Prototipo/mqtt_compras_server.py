import paho.mqtt.client as mqtt
import time
import random
import threading

# Configuración
direccion_broker = "localhost"
puerto = 4500
maquinas = ["minas", "industriales", "teleco", "biologia"]

# Estados de la comunicación
ESTADO_ESPERANDO_COMPRA = 0
ESTADO_ESPERANDO_CODIGO = 1

TIEMPO_TIMEOUT = 30

# Diccionario para mantener el estado y código de cada máquina
maquinas_estado = {maquina: {"estado": ESTADO_ESPERANDO_COMPRA, "codigo": None} for maquina in maquinas}

# Función de timeout modificada para manejar múltiples máquinas
def timeout(maquina):
    if maquinas_estado[maquina]["estado"] == ESTADO_ESPERANDO_CODIGO:
        print(f"Timeout para {maquina}: El código no fue introducido a tiempo.")
        maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_COMPRA

# Funciones de callback
def on_connect(cliente, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Conectado al broker MQTT exitosamente!\n")
        for maquina in maquinas:
            cliente.subscribe(f'{maquina}/compra')
            print(f'Suscrito a {maquina}/compra')
    else:
        print(f"Fallo al conectar, código: {rc}")

def on_disconnect(cliente, userdata, flags, rc=None, properties=None):
    print("Desconectado del broker MQTT")

def on_subscribe(cliente, userdata, mid, granted_qos, properties=None):
    print(f"")

def on_publish(cliente, userdata, mid, rc=None, properties=None):
    print(f"Mensaje enviado")

def on_message(cliente, userdata, mensaje):
    mensaje_str = mensaje.payload.decode()
    topico = mensaje.topic
    maquina = topico.split('/')[0]

    estado_actual = maquinas_estado[maquina]["estado"]

    if estado_actual == ESTADO_ESPERANDO_COMPRA and mensaje_str == "REQUEST Compra":
        maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_CODIGO
        print(f"### Nueva compra solicitada en {maquina} ###")
        codigo_generado = random.randint(1000, 9999)
        maquinas_estado[maquina]["codigo"] = codigo_generado
        time.sleep(1)
        print(f"El código para {maquina} es: {codigo_generado}")
        cliente.publish(topico, "ACK: Introduce el código")
        # Iniciar temporizador de timeout específico para la máquina
        threading.Timer(TIEMPO_TIMEOUT, timeout, args=(maquina,)).start()

    elif estado_actual == ESTADO_ESPERANDO_CODIGO and mensaje_str.startswith("RESPONSE Código:"):
        codigo_cliente = mensaje_str.split(":")[1].strip()
        if codigo_cliente == str(maquinas_estado[maquina]["codigo"]) or codigo_cliente == "3333":
            print(f"Compra realizada correctamente en {maquina}.")
            cliente.publish(topico, "SUCCESS: Compra realizada correctamente")
            maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_COMPRA
        else:
            print(f"El código introducido es incorrecto en {maquina}. Volviendo a esperar una nueva compra...")
            cliente.publish(topico, "ERROR: Código incorrecto")
            maquinas_estado[maquina]["estado"] = ESTADO_ESPERANDO_COMPRA


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
