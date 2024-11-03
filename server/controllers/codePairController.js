const { CodePair } = require('../models');

exports.getCodePair = async (req, res, next) => {
    try {
        const { codePairId } = req.params;
        const codePair = await CodePair.findById(codePairId);

        if (codePair) {
            res.json({ success: true, codePair });
        }
        else {
            res.status(404).json({ success: false, message: 'Code pair not found' });
        }
    }
    catch (error) {
        next(error);
    }
}