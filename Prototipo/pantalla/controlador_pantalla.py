import serial
import time

# Configura el puerto serial y la velocidad de baudios
arduino = serial.Serial(port='COM4', baudrate=115200, timeout=1)

def send_to_arduino(send_str):
    send_str += ';'
    print(send_str)
    arduino.write(send_str.encode())

def read_arduino():
    """Lee los datos enviados por el Arduino."""
    try:
        while True:
            data_bytes = arduino.readline()[:-2]  # Leer una línea del puerto serial
            if data_bytes:
                data_str = data_bytes.decode()  # Convertir los bytes a string
                print(data_str)
                
    except KeyboardInterrupt:
        print("\nInterrupción por el usuario. Deteniendo...")
    finally:
        arduino.close()  # Asegurarse de cerrar el puerto serial antes de terminar
        print("Conexión Serial cerrada. Programa terminado.")

if __name__ == "__main__":
    print("Iniciando comunicación con Arduino...")
    time.sleep(2) 
    send_to_arduino("2,")
    time.sleep(5) 
    send_to_arduino("3,")
    time.sleep(5) 
    send_to_arduino("4,")
    time.sleep(5) 
    send_to_arduino("1,3333")    
    time.sleep(2) 
    send_to_arduino("2,")