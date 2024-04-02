import serial
import datetime
import json

arduino = None

def leer_datos_desde_arduino(puerto_serie, baudios, archivo_log):
    try:
        arduino = serial.Serial(puerto_serie, baudios, timeout=1)
        print(f"Conexión exitosa a {puerto_serie} a {baudios} baudios")
        
        with open(archivo_log, "w") as log_file:
            log_file.write("Inicio del registro:\n")

        contador_bucle = 0
        num_solidos = 10
        nombre_maquina = "Teleco"



        while True:
            
            contador_bucle +=1
            
            datos = arduino.readline().decode("utf-8", errors="replace")
            datos_limpios = datos.strip()
            if contador_bucle == 1:
                altura_cafe_ml = datos_limpios
                nivel_cafe_ml = 100
            elif contador_bucle == 2:
                altura_leche_ml = datos_limpios
                nivel_leche_ml = 80
            elif contador_bucle == 3:
                nivel_azucar_gr = datos_limpios
            elif contador_bucle == 4:
                estado_fototransistor = datos_limpios
                contador_bucle = 0
                if estado_fototransistor == 1:
                    contador -=1 

                niveles = {
                    'maquina': nombre_maquina,
                    'niveles': {
                        'nivel_cafe_ml': nivel_cafe_ml,
                        'nivel_leche_ml': nivel_leche_ml,
                        'nivel_azucar_gr': nivel_azucar_gr,
                        'solidos_u': num_solidos
                        }
        
                    }
                niveles_json = json.dumps(niveles)
                print(niveles_json)

            with open(archivo_log, "a") as log_file:
                now = datetime.datetime.now().strftime("%m/%d/%Y-%H:%M:%S")
                log_file.write(f"{now} - Datos recibidos desde Arduino: {datos_limpios}\n")

            #print(f"{now} - Datos recibidos desde Arduino: {datos_limpios}")

    except Exception as e:
        print(f"No se pudo establecer la conexión con Arduino: {str(e)}")

    finally:
        if arduino is not None and arduino.is_open:
            arduino.close()
            print("Conexión cerrada")




if __name__ == "__main__":
    puerto_serie_arduino = "COM6" 
    baudios_arduino = 9600
    archivo_log = "test_arduino.log"
    leer_datos_desde_arduino(puerto_serie_arduino,baudios_arduino,"aa.txt")
    
    #leer_datos_desde_arduino(puerto_serie_arduino, baudios_arduino, archivo_log)
