import serial
import time
import json

# Configura el puerto serial y la velocidad de baudios
arduino = serial.Serial(port='COM3', baudrate=115200, timeout=1)

# Diccionario para reemplazar los identificadores de sensor por nombres descriptivos
sensor_names = {
    "Sensor1": "nivel_agua_cm",
    "Sensor2": "nivel_leche_cm",
    "Pulso" : "pulso"
}

# Umbral para determinar si hubo un cambio significativo
threshold = 2

# Diccionario para almacenar los últimos valores leídos
last_values = {}

def conversion(data_dict):
    area = 100
    for key, value in data_dict.items():
        # Redondea el resultado a dos decimales
        data_dict[key] = round(value * area, 2)
    return data_dict

def parse_data(data_str):
    data_dict = {}
    parts = data_str.split(',')
    for part in parts:
        key, value = part.split(':')
        descriptive_key = sensor_names.get(key, key)
        data_dict[descriptive_key] = float(value)
    # Obtenemos la conversión
    data_dict = conversion(data_dict)
    return data_dict

def filtro_datos(new_data):
    global last_values
    for key, new_value in new_data.items():
        if key in last_values:
            # Comprueba si el cambio es mayor que el umbral
            if abs(new_value - last_values[key]) > threshold:
                last_values[key] = new_value
                return True
        else:
            last_values[key] = new_value
            return True
    return False

def read_arduino():
    try:
        while True:
            data_bytes = arduino.readline()[:-2]  # Leer una línea del puerto serial
            if data_bytes:
                data_str = data_bytes.decode()  # Convertir los bytes a string
                data_dict = parse_data(data_str)  # Analizar la cadena de datos en un diccionario
                
                # Solo muestra los nuevos datos si hay un cambio significativo
                if filtro_datos(data_dict):
                    json_data = json.dumps(data_dict)  # Convertir el diccionario a JSON
                    print(json_data)
                else:
                    print("sin cambios",last_values)
    except KeyboardInterrupt:
        print("\nInterrupción por el usuario. Deteniendo...")
    finally:
        arduino.close()  # Asegurarse de cerrar el puerto serial antes de terminar
        print("Conexión Serial cerrada. Programa terminado.")

if __name__ == "__main__":
    print("Iniciando lectura de datos del Arduino...")
    time.sleep(2) 
    read_arduino()
