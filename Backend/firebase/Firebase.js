const admin = require('firebase-admin');

const serviceAccountClients = require('./lpro-e1d36-firebase-adminsdk-qvco3-f1151578a9.json');
const serviceAccountWorkers = require('./lpro-workers-firebase-adminsdk-yf4f8-595b4803e9.json');

// Inicializa la instancia para clientes
const clientApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountClients)
}, 'clients'); 

// Inicializa la instancia para trabajadores
const workerApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountWorkers)
}, 'workers');

// Accediendo a Firestore para cada instancia
const dbClients = clientApp.firestore();
const dbWorkers = workerApp.firestore();

module.exports = { admin, dbClients, dbWorkers };
