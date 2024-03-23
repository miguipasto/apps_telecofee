// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rutas = require('./rutas/rutas')
dotenv.config();

const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', rutas);

app.listen(config.port, () =>
  console.log(`Server is live @ ${config.hostUrl}`),
);
