const admin = require('firebase-admin');

const serviceAccount = require('./lpro-e1d36-firebase-adminsdk-qvco3-f1151578a9.json')

if (admin.apps.length === 0) { // Esto evita la inicialización múltiple
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

module.exports = { admin, db };