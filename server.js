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

app.post('/upload', upload.single('file'), (req, res) => {
    const excelFile = req.file.path;

    // Execute the Python script with the 'py' command
    const pythonProcess = spawn('py', ['contrato.py', excelFile]);

    pythonProcess.on('exit', (code) => {
        if (code === 0) {
            const outputDir = 'contratos';
            const zipFile = 'contratos.zip';

            const output = fs.createWriteStream(zipFile);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                // Delete the output directory and files after creating the zip
                fs.rmSync(outputDir, { recursive: true, force: true });

                res.download(zipFile, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    // Delete the zip file after download
                    fs.unlinkSync(zipFile);
                });
            });

            archive.pipe(output);
            archive.directory(outputDir, false);
            archive.finalize();
        } else {
            res.status(500).send('Erro ao gerar contratos');
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
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