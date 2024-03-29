const express = require('express');
const router = express.Router();
const { dbClients, dbWorkers } = require('../firebase/Firebase'); 
const { Timestamp } = require('firebase-admin/firestore');


router.get('/', (req, res) => {
    res.json({
      "API Usage": [
        {
          "endpoint": "/api/compras",
          "method": "GET",
          "description": "Obtiene las compras realizadas.",
          "query_parameters": {
            "nombre_maquina": "El nombre de la máquina para filtrar las compras.",
            "fecha": "Para filtrar por fecha específica usa 'YYYY-MM-DD' o 'Xd' para los últimos X días."
          }
        },
        {
          "endpoint": "/api/niveles",
          "method": "GET",
          "description": "Obtiene los niveles de las máquinas.",
          "query_parameters": {
            "nombre_maquina": "El nombre de la máquina (opcional).",
            "fecha": "Para filtrar por fecha específica usa 'YYYY-MM-DD' o 'Xd' para los últimos X días.",
            "cantidad": "'last' para obtener el último registro."
          }
        },
        {
            "endpoint": "/api/incidencias",
            "method": "GET",
            "description": "Obtiene las incidencias.",
        }
      ]
    });
  });
  

// Compras
router.get('/compras', async (req, res) => {
    const { nombre_maquina, fecha } = req.query;

    try {
        const comprasSnapshot = await dbClients.collectionGroup('compras').get();

        if (comprasSnapshot.empty) {
            console.log('No se encontraron documentos.');
            return res.status(404).json([]);
        }

        let comprasFiltradas = comprasSnapshot.docs.map(doc => ({
            id: doc.id,
            parentPath: doc.ref.parent.path,
            ...doc.data()
        }));

        // Filtrado por máquina
        if (nombre_maquina) {
            comprasFiltradas = comprasFiltradas.filter(compra => compra.maquina === nombre_maquina);
        }

        // Filtrado por fecha
        if (fecha) {
            if (fecha.endsWith('d')) {
                // Filtrar por rango de días
                const dias = parseInt(fecha);
                const fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - dias);
                fechaInicio.setHours(0, 0, 0, 0);
                
                comprasFiltradas = comprasFiltradas.filter(compra => {
                    const fechaCompra = new Date(compra.fecha._seconds * 1000);
                    return fechaCompra >= fechaInicio;
                });
            } else if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Filtrar por fecha específica
                const fechaInicio = new Date(fecha);
                fechaInicio.setHours(0, 0, 0, 0);
                const fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaFin.getDate() + 1);
                
                comprasFiltradas = comprasFiltradas.filter(compra => {
                    const fechaCompra = new Date(compra.fecha._seconds * 1000);
                    return fechaCompra >= fechaInicio && fechaCompra < fechaFin;
                });
            }
        }

        res.json(comprasFiltradas);
    } catch (error) {
        console.error('Error al acceder a Firestore:', error);
        res.status(500).send('Error interno del servidor');
    }
});



// Niveles
router.get('/niveles', async (req, res) => {
    try {
        const { nombre_maquina, fecha, cantidad } = req.query;
        let niveles = [];
        const maquinas = nombre_maquina ? [nombre_maquina] : ["minas", "teleco", "biologia", "industriales"];
        let allNiveles = [];

        for (const maquina of maquinas) {
            let nivelesRef = dbWorkers.collection(`niveles/${maquina}/historial_niveles`);
            
              // Filtrar por rango de días
              if (fecha && fecha.endsWith('d')) {
                const dias = parseInt(fecha);
                const fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - dias);
                nivelesRef = nivelesRef.where('fecha', '>=', Timestamp.fromDate(fechaInicio));
            } else if (fecha && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const fechaInicio = new Date(fecha);
                const fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaFin.getDate() + 1);
                nivelesRef = nivelesRef.where('fecha', '>=', Timestamp.fromDate(fechaInicio))
                                       .where('fecha', '<', Timestamp.fromDate(fechaFin));
            }

            let snapshot = await nivelesRef.orderBy('fecha', 'asc').get();

            if (!snapshot.empty) {
                let nivelesMaquina = snapshot.docs.map(doc => ({
                    maquina: maquina,
                    id: doc.id,
                    ...doc.data()
                }));
                allNiveles = allNiveles.concat(nivelesMaquina);
            }
        }

        if (cantidad === 'last' && fecha) {
            // Agrupar por día y luego seleccionar el último registro de cada día
            let nivelesAgrupadosPorDia = {};
            allNiveles.forEach(nivel => {
                const fecha = nivel.fecha.toDate().toISOString().split('T')[0]; // 'YYYY-MM-DD'
                if (!nivelesAgrupadosPorDia[fecha]) {
                    nivelesAgrupadosPorDia[fecha] = [];
                }
                nivelesAgrupadosPorDia[fecha].push(nivel);
            });

            niveles = Object.values(nivelesAgrupadosPorDia).map(nivelesPorDia => nivelesPorDia[nivelesPorDia.length - 1]);
        } else if (cantidad === 'last' && !fecha) {
            // Filtrar para obtener el último nivel de cada máquina
            let lastNiveles = [];
            maquinas.forEach(maquina => {
                let nivelesMaquina = allNiveles.filter(nivel => nivel.maquina === maquina);
                if (nivelesMaquina.length > 0) {
                    lastNiveles.push(nivelesMaquina[nivelesMaquina.length - 1]);
                }
            });
            niveles = lastNiveles;
        } else {
            niveles = allNiveles;
        }

        if (niveles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron niveles para la(s) máquina(s) especificada(s)',
            });
        }

        res.status(200).json({
            success: true,
            message: nombre_maquina ? `Niveles obtenidos correctamente para la máquina: ${nombre_maquina}` : "Niveles obtenidos correctamente para todas las máquinas",
            data: niveles
        });

    } catch (error) {
        console.error('Error al acceder a Firestore:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los niveles',
            error: error.message
        });
    }
});


// Incidencias
router.get('/incidencias', async (req, res) => {

        try {
            const comprasSnapshot = await dbClients.collectionGroup('incidencias').get();

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
});

module.exports = router;
