const express = require('express');
const router = express.Router();
const { getCodePair } = require('../controllers/codePairController');

router.get('/:codePairId', getCodePair);

module.exports = router;