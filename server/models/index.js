const mongoose = require('mongoose');

// User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Code Pair model
const codePairSchema = new mongoose.Schema({
  hash: String,
  version1: String,
  version2: String,
  projectName: String,
  commitHash: String,
  commitMessage: String,
  performanceChange: String,
});

const CodePair = mongoose.model('CodePair', codePairSchema);

// Code Review model
const codeReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  codePairId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodePair' },
  category: String,
});

const CodeReview = mongoose.model('CodeReview', codeReviewSchema);

module.exports = {
  User,
  CodePair,
  CodeReview,
};