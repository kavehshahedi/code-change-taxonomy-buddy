const { CodePair, CodeReview } = require('../models');

exports.getNextCodePair = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviewedPairs = await CodeReview.find({ userId }).distinct('codePairId');
    const nextCodePair = await CodePair.findOne({ _id: { $nin: reviewedPairs } });

    if (nextCodePair) {
      res.json({
        success: true,
        codePair: {
          id: nextCodePair._id,
          version1: nextCodePair.version1,
          version2: nextCodePair.version2,
          commitMessage: nextCodePair.commitMessage,
        },
      });
    } else {
      res.json({ success: false, message: 'No more code pairs to review' });
    }
  } catch (error) {
    next(error);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { userId, codePairId, categories, isFunctionalityChange} = req.body;

    const existingReview = await CodeReview.findOne({ userId, codePairId });
    if (existingReview) {
      const updatedReview = await CodeReview.findByIdAndUpdate(
        existingReview._id,
        { categories, isFunctionalityChange },
        { new: true }
      );
      return res.json({
        success: true,
        message: 'Review updated successfully',
        review: {
          id: updatedReview._id,
          categories: updatedReview.categories,
          isFunctionalityChange: updatedReview.isFunctionalityChange,
        },
      });
    }

    const newReview = new CodeReview({ userId, codePairId, categories, isFunctionalityChange});
    await newReview.save();
    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const totalPairs = await CodePair.countDocuments();
    const reviewedPairs = await CodeReview.countDocuments({ userId });
    res.json({
      success: true,
      progress: {
        total: totalPairs,
        completed: reviewedPairs,
        remaining: totalPairs - reviewedPairs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await CodeReview.find({ userId }).sort({ _id: -1 });
    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        categories: review.categories,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const { userId, targetId } = req.params;
    const { type = 'reviewId' } = req.query;

    const query = type === 'codePairId' 
      ? { codePairId: targetId, userId } 
      : { _id: targetId, userId };

    const review = await CodeReview.findOne(query).populate('codePairId');
    if (review) {
      res.json({
        success: true,
        review: {
          id: review._id,
          categories: review.categories,
          codePair: {
            id: review.codePairId._id,
            version1: review.codePairId.version1,
            version2: review.codePairId.version2,
            commitMessage: review.codePairId.commitMessage,
            isFunctionalityChange: review.isFunctionalityChange,
          },
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'Review not found' });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { categories, isFunctionalityChange } = req.body;
    const updatedReview = await CodeReview.findByIdAndUpdate(
      reviewId,
      { categories, isFunctionalityChange},
      { new: true }
    );
    if (updatedReview) {
      res.json({
        success: true,
        review: {
          id: updatedReview._id,
          categories: updatedReview.categories,
          isFunctionalityChange: updatedReview.isFunctionalityChange,
        },
        message: 'Review updated successfully',
      });
    } else {
      res.status(404).json({ success: false, message: 'Review not found' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getNextOrLatestReview = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // First, try to get an unreviewed code pair
    const reviewedPairs = await CodeReview.find({ userId }).distinct('codePairId');
    const nextCodePair = await CodePair.findOne({ _id: { $nin: reviewedPairs } });

    if (nextCodePair) {
        res.json({
            success: true,
            type: 'new',
            codePair: {
                id: nextCodePair._id,
                version1: nextCodePair.version1,
                version2: nextCodePair.version2,
                commitMessage: nextCodePair.commitMessage,
            },
        });
    } else {
        // If all pairs are reviewed, return null
        res.json({
            success: true,
            type: 'completed',
            message: 'All code pairs have been reviewed'
        });
    }
} catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
}
};