const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const reviewRoutes = require('./reviewRoutes');
const adminRoutes = require('./adminRoutes');
const codePairRoutes = require('./codePairRoutes');

router.use('/auth', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/code-pairs', codePairRoutes);

module.exports = router;