const express = require('express');
const router = express.Router();
const multer = require('multer');
const { formContract, downloadContract, uploadContract } = require('../controllers/formController');

const upload = multer({ dest: 'uploads/' });

router.post('/contrato', formContract);

router.get('/download', downloadContract);

router.post('/upload', upload.single('file'), uploadContract);

module.exports = router 