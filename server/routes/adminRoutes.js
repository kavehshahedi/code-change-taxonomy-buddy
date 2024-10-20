const express = require('express');
const router = express.Router();
const { importCodePairs } = require('../controllers/adminController');

router.post('/import-code-pairs', importCodePairs);

module.exports = router;