const express = require('express');
const router = express.Router();
const { 
  getNextCodePair, 
  submitReview, 
  getProgress, 
  getUserReviews, 
  getReview,
  updateReview,
  getNextOrLatestReview
} = require('../controllers/reviewController');

router.get('/next-code-pair/:userId', getNextCodePair);
router.post('/submit', submitReview);
router.get('/progress/:userId', getProgress);
router.get('/user/:userId', getUserReviews);
router.get('/review/:userId/:reviewId', getReview);
router.put('/:reviewId', updateReview);
router.get('/next-or-latest/:userId', getNextOrLatestReview);

module.exports = router;