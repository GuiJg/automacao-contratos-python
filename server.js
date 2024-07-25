const { execSync } = require('child_process');

try {
    // Install Python dependencies
    execSync('py -m pip install -r requirements.txt', { stdio: 'inherit' });
} catch (err) {
    console.error('Erro ao instalar dependências Python:', err);
}

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const archiver = require('archiver');
const { spawn } = require('child_process');
const formRoute = require('./routes/formRoute');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', formRoute);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

mongoose.connect("mongodb+srv://admin:admin@admin-automa.cipxvr5.mongodb.net/Automacao?retryWrites=true&w=majority&appName=admin-automa")
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
        console.log("Conectado ao MongoDB");
        app.get('/', (req, res) => {
            res.send("Servidor Conectado");
        });
    })
    .catch((err) => {
        console.log(err);
    });
