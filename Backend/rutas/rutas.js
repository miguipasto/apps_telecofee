const express = require('express');
const router = express.Router();
const { dbClients, dbWorkers } = require('../firebase/Firebase'); 
const { Timestamp } = require('firebase-admin/firestore');


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

// Compras
router.get('/compras', async (req, res) => {
    const { nombre_maquina } = req.query;

    try {
        const comprasSnapshot = await dbClients.collectionGroup('compras').get();

        if (comprasSnapshot.empty) {
            console.log('No se encontraron documentos.');
            return res.status(404).json([]);
        }

        let comprasFiltradas = [];
        if(nombre_maquina){ // Filtro de máquina
            comprasFiltradas = comprasSnapshot.docs
            .map(doc => ({
                id: doc.id,
                parentPath: doc.ref.parent.path,
                ...doc.data()
            }))
            .filter(compra => compra.maquina === nombre_maquina); 
        } else { //Todas
            comprasFiltradas = comprasSnapshot.docs
            .map(doc => ({
                id: doc.id,
                parentPath: doc.ref.parent.path,
                ...doc.data()
            })) 
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
        let nivelesRef;
        let snapshot;
        let niveles = [];

        if (nombre_maquina) {
            nivelesRef = dbWorkers.collection(`niveles/${nombre_maquina}/historial_niveles`);

            // Filtrar por rango de días
            if (fecha && fecha.endsWith('d')) {
                const dias = parseInt(fecha);
                const fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - dias);
                nivelesRef = nivelesRef.where('fecha', '>=', Timestamp.fromDate(fechaInicio));
            }
            // Filtrar por fecha específica
            else if (fecha && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const fechaInicio = new Date(fecha);
                const fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaFin.getDate() + 1);
                nivelesRef = nivelesRef.where('fecha', '>=', Timestamp.fromDate(fechaInicio))
                                       .where('fecha', '<', Timestamp.fromDate(fechaFin));
            }

            snapshot = await nivelesRef.get();

            if (!snapshot.empty) {
                niveles = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }

            // Filtrar por cantidad
            if (cantidad === 'last') {
                niveles = [niveles[niveles.length - 1]]; 
            }

        } else {
            const maquinas = ["minas", "teleco", "biologia", "industriales"];
            let allNiveles = [];

            for (const maquina of maquinas) {
                let nivelesRef = dbWorkers.collection(`niveles/${maquina}/historial_niveles`);
                
                // Filtrar por rango de días
            if (fecha && fecha.endsWith('d')) {
                const dias = parseInt(fecha);
                const fechaInicio = new Date();
                fechaInicio.setDate(fechaInicio.getDate() - dias);
                nivelesRef = nivelesRef.where('fecha', '>=', Timestamp.fromDate(fechaInicio));
            }
            // Filtrar por fecha específica
            else if (fecha && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const fechaInicio = new Date(fecha);
                const fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaFin.getDate() + 1);
                nivelesRef = nivelesRef.where('fecha', '>=', Timestamp.fromDate(fechaInicio))
                                       .where('fecha', '<', Timestamp.fromDate(fechaFin));
            }

                let snapshot = await nivelesRef.get();

                if (!snapshot.empty) {
                    let nivelesMaquina = snapshot.docs.map(doc => ({
                        maquina: maquina,
                        id: doc.id,
                        ...doc.data()
                    }));
                    allNiveles = allNiveles.concat(nivelesMaquina);
                }
            }

            if (cantidad === 'last') {
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
