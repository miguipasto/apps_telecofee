// server.js
const express = require('express');
const cors = require('cors');
const rutas = require('./rutas/rutas')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', rutas);

const port = 5000
const hostUrl = 'localhost'
app.listen(port, () =>
  console.log(`Server is live @ ${hostUrl}:${port}`),
);
