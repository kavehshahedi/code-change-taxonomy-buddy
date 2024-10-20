const { CodePair } = require('../models');

exports.importCodePairs = async (req, res, next) => {
  try {
    const { codePairs } = req.body;
    await CodePair.insertMany(codePairs);
    res.json({ success: true, message: 'Code pairs imported successfully' });
  } catch (error) {
    next(error);
  }
};