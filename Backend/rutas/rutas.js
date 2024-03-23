const express = require('express');
const fs = require('fs').promises; // Para leer el archivo de compras simuladas
const { db } = require('./../Firebase'); 
const router = express.Router();

router.get('/', (req, res) => {
  res.send([
    "http://localhost:5000/api/teleco/compras",
    "http://localhost:5000/api/biologia/compras",
    "http://localhost:5000/api/minas/compras",
    "http://localhost:5000/api/industriales/compras",
    "http://localhost:5000/api/teleco/nivel",
    "http://localhost:5000/api/biologia/nivel",
    "http://localhost:5000/api/minas/nivel",
    "http://localhost:5000/api/industriales/nivel"
]);
});

const path = "/home/lpro/apps_telecofee/Backend/dataset_simulacion"


// Compras según máquina
router.get('/:nombre_maquina/compras', async (req, res) => {
    const { nombre_maquina } = req.params;
    console.log()

    // Determinar acción basada en el tipo de máquina
    if (nombre_maquina === 'teleco') {
        try {
            const comprasSnapshot = await db.collectionGroup('compras').get();

            if (comprasSnapshot.empty) {
                console.log('No se encontraron documentos.');
                return res.status(404).json([]);
            }

            const compras = comprasSnapshot.docs.map(doc => ({
                id: doc.id,
                parentPath: doc.ref.parent.path,
                ...doc.data()
            }));
            
            console.log(compras);
            res.json(compras);
        } catch (error) {
            console.error('Error al acceder a Firestore:', error);
            res.status(500).send('Error interno del servidor');
        }
    } else {
        // Leer de un archivo de compras simuladas
        try {
            // Se corrige la manera de incluir el nombre de la máquina en la ruta del archivo
            const compras = await fs.readFile(`${path}/compras_simuladas_${nombre_maquina}.json`, 'utf8');
            res.json(JSON.parse(compras));
        } catch (error) {
            console.error('Error al leer el archivo de compras simuladas:', error);
            res.status(500).send('Error interno del servidor');
        }
    } 
});

// Nivel según máquina
router.get('/:nombre_maquina/nivel', async (req, res) => {
    const { nombre_maquina } = req.params;

    // Leer de un archivo de compras simuladas
    try {
        // Se corrige la manera de incluir el nombre de la máquina en la ruta del archivo
        const compras = await fs.readFile(`${path}/nivel_simulado_${nombre_maquina}.json`, 'utf8');
        res.json(JSON.parse(compras));
    } catch (error) {
        console.error('Error al leer el archivo de compras simuladas:', error);
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;
