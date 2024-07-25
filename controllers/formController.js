const { spawn } = require('child_process');
const expressAsyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

const formContract = expressAsyncHandler(async (req, res) => {
    const { contratante, empresa, cnpj, rua, bairro, numero, cidade, estado, cep, orcamento, vencimento } = req.body;

    const pythonProcess = spawn('py', [
        path.join(__dirname, '../script.py'),
        contratante, empresa, cnpj, rua, bairro, numero, cidade, estado, cep, orcamento, vencimento
    ]);

    pythonProcess.stdout.on('data', (data) => {
        const outputPath = decodeURIComponent(data.toString().trim());
        const filename = path.basename(outputPath);
        console.log(`Generated filename: ${filename}`);
        res.json({ filename: encodeURIComponent(filename) });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Process exited with code: ${code}`);
            res.status(500).json({ error: 'Erro ao gerar contrato' });
        }
    });
});

const downloadContract = expressAsyncHandler(async (req, res) => {
    const filename = req.query.filename;
    const filePath = path.join(__dirname, "../contratos", filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Arquivo não encontrado");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    readStream.on('end', () => {
        // Delete all files in the "contratos" directory
        const contractsDir = path.join(__dirname, "../contratos");
        fs.readdir(contractsDir, (err, files) => {
            if (err) {
                console.error(`Erro ao ler a pasta de contratos: ${err}`);
                return;
            }
            files.forEach(file => {
                const fileToDelete = path.join(contractsDir, file);
                fs.unlink(fileToDelete, (err) => {
                    if (err) {
                        console.error(`Erro ao excluir o arquivo ${file}: ${err}`);
                    } else {
                        console.log(`Arquivo ${file} excluído com sucesso`);
                    }
                });
            });
        });
    });
});

module.exports = { formContract, downloadContract };