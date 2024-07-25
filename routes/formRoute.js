const express = require('express');
const router = express.Router();
const { formContract, downloadContract } = require('../controllers/formController');

router.post('/contrato', formContract);

router.get('/download', downloadContract);

module.exports = router 