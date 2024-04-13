import serial
import time
import json

# Configura el puerto serial y la velocidad de baudios
arduino = serial.Serial(port='/dev/ttyACM0', baudrate=57600, timeout=1)
niveles_maximos = {"nivel_cafe_gr": 100, "nivel_leche_ml": 4800, "nivel_agua_ml": 4800, "patatillas_u": 10}
niveles = {"nivel_cafe_gr": 0, "nivel_leche_ml": 0, "nivel_agua_ml": 0, "patatillas_u": 10}

def convert_cm_to_ml(distance_measured, width=13.5, length=24.5, height=16.5):
    liquid_height = height - distance_measured
    return round((liquid_height * width * length), 2)

def update_levels(data_dict):
    print(data_dict)
    niveles["nivel_cafe_gr"] = data_dict["peso_gr"]
    niveles["nivel_leche_ml"] = convert_cm_to_ml(data_dict["sensor_1_cm"])
    niveles["nivel_agua_ml"] = convert_cm_to_ml(data_dict["sensor_2_cm"])
    for key in ["nivel_cafe_gr", "nivel_leche_ml", "nivel_agua_ml"]:
        percentage_key = key[:-3] + "_pr"
        niveles[percentage_key] = round((niveles[key] / niveles_maximos[key]) * 100, 2)
    niveles["patatillas_pr"] = round((niveles["patatillas_u"] / niveles_maximos["patatillas_u"]) * 100, 2)

def product_ack():
    if niveles["patatillas_u"] > 0:
        niveles["patatillas_u"] -= 1
        niveles["patatillas_pr"] = round((niveles["patatillas_u"] / niveles_maximos["patatillas_u"]) * 100, 2)

def send_levels():
    json_data = json.dumps(niveles)
    print(json_data)

def read_arduino():
    try:
        while True:
            data_bytes = arduino.readline()[:-2]  # Leer una línea del puerto serial
            if data_bytes:
                data_str = data_bytes.decode()  # Convertir los bytes a string
                if(data_str.startswith("Fototransistor")):
                    product_ack()
                elif data_str.startswith("{"):
                    data_dict = json.loads(data_str)
                    update_levels(data_dict)
                else:
                    print(data_str)
                
                send_levels()
    except KeyboardInterrupt:
        print("\nInterrupción por el usuario. Deteniendo...")
    finally:
        arduino.close()  # Asegurarse de cerrar el puerto serial antes de terminar
        print("Conexión Serial cerrada. Programa terminado.")

if __name__ == "__main__":
    print("Iniciando lectura de datos del Arduino...")
    read_arduino()
