import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, ChevronLeft, ChevronRight, Edit, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css';

const DashboardCard = ({ title, value, subValue, color }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <div className="flex justify-between items-center mb-2">
      <div className="text-gray-400">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
    <div className="text-xs text-gray-500">{subValue}</div>
  </div>
);

const CodeEditor = ({ title, code }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-200 mb-2">{title}</h3>
      <pre className="p-4 rounded-md overflow-auto" style={{ background: 'transparent' }}>
        <code className="language-java">{code}</code>
      </pre>
    </div>
  );
};

const CategoryButton = ({ category, isSelected, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isSelected
        ? 'bg-blue-500 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} w-full`}
  >
    {category}
  </button>
);

const CodeChangeTaxonomyBuddy = ({ username, userId, onLogout }) => {
  const [currentReview, setCurrentReview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState({ total: 0, completed: 0, remaining: 0 });
  const [allReviews, setAllReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(-1);
  const [isReviewingOld, setIsReviewingOld] = useState(false);
  const [allReviewsCompleted, setAllReviewsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const categories = [
    "Algorithmic Change",
    "Control Flow/Loop Changes",
    "Data Structure & Variable Changes",
    "Refactoring & Code Cleanup",
    "Exception & Input/Output Handling",
    "Concurrency/Parallelism",
    "API/Library Call Changes",
    "Security Fix",
    "Other"
  ];

  const fetchNextOrLatestReview = async () => {
    try {
      const response = await axios.get(`/reviews/next-or-latest/${userId}`);
      if (response.data.success) {
        if (response.data.type === 'new') {
          setCurrentReview({
            codePair: response.data.codePair,
            category: null,
          });
          setSelectedCategory(null);
          setIsReviewingOld(false);
          setAllReviewsCompleted(false);
        } else if (response.data.type === 'completed') {
          setCurrentReview(null);
          setIsReviewingOld(false);
          setAllReviewsCompleted(true);
        }
        setCurrentReviewIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
      setCurrentReview(null);
    }
  };

  const fetchAllReviews = async () => {
    try {
      const response = await axios.get(`/reviews/user/${userId}`);
      if (response.data.success) {
        setAllReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching all reviews:', error);
    }
  };

  const fetchSpecificReview = async (reviewId) => {
    try {
      const response = await axios.get(`/reviews/review/${userId}/${reviewId}`);
      if (response.data.success) {
        setCurrentReview(response.data.review);
        setSelectedCategory(response.data.review.category);
        setIsReviewingOld(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error fetching specific review:', error);
    }
  };

  const handleCategorySelect = (category) => {
    if (category === "Other") {
      setSelectedCategory("Other");
    } else {
      setSelectedCategory(category);
      setCustomCategory('');
    }
  };

  const submitReview = async () => {
    if (!currentReview || (!selectedCategory && selectedCategory !== "Other")) return;

    const categoryToSubmit = selectedCategory === "Other" ? customCategory : selectedCategory;
    if (selectedCategory === "Other" && !customCategory.trim()) return;

    try {
      if (isReviewingOld) {
        await axios.put(`/reviews/${currentReview.id}`, {
          category: categoryToSubmit,
        });
        setIsEditing(false);
      } else {
        await axios.post(`/reviews/submit`, {
          userId,
          codePairId: currentReview.codePair.id,
          category: categoryToSubmit,
        });
      }
      fetchNextOrLatestReview();
      fetchAllReviews();
      fetchProgress();
      setCustomCategory('');
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const navigateReview = (direction) => {
    const newIndex = currentReviewIndex + direction;
    if (newIndex >= 0 && newIndex < allReviews.length) {
      setCurrentReviewIndex(newIndex);
      fetchSpecificReview(allReviews[newIndex].id);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/reviews/progress/${userId}`);
      if (response.data.success) {
        setProgress(response.data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  useEffect(() => {
    fetchNextOrLatestReview();
    fetchAllReviews();
    fetchProgress();
  }, [userId]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <div className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Code Change Taxonomy Buddy</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">{username}</span>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-white focus:outline-none"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <DashboardCard title="Total Reviews" value={progress.total} subValue="reviews" color="text-blue-400" />
            <DashboardCard title="Completed" value={progress.completed} subValue="reviews" color="text-green-400" />
            <DashboardCard title="Remaining" value={progress.remaining} subValue="reviews" color="text-yellow-400" />
          </div>

          {currentReview ? (
            <>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <CodeEditor
                  title="Version 1"
                  code={currentReview.codePair.version1}
                />
                <CodeEditor
                  title="Version 2"
                  code={currentReview.codePair.version2}
                />
              </div>

              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-200">
                    {isReviewingOld && !isEditing ? "Selected Category" : "Select Category"}
                  </h3>
                  {isReviewingOld && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-blue-400 hover:text-blue-300 focus:outline-none"
                    >
                      {isEditing ? <Check size={20} /> : <Edit size={20} />}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <CategoryButton
                      key={category}
                      category={category}
                      isSelected={selectedCategory === category}
                      onClick={() => (isEditing || !isReviewingOld) && handleCategorySelect(category)}
                      disabled={isReviewingOld && !isEditing}
                    />
                  ))}
                </div>
                {selectedCategory === "Other" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      disabled={isReviewingOld && !isEditing}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => navigateReview(-1)}
                  disabled={currentReviewIndex <= 0}
                  className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={20} className="mr-2" /> Previous
                </button>
                {(!isReviewingOld || isEditing) && (
                  <button
                    onClick={submitReview}
                    disabled={!selectedCategory || (selectedCategory === "Other" && !customCategory.trim())}
                    className={`px-6 py-2 rounded-full text-white font-medium ${selectedCategory && (selectedCategory !== "Other" || customCategory.trim())
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-600 cursor-not-allowed'
                      }`}
                  >
                    {isEditing ? 'Update Review' : 'Submit Review'}
                  </button>
                )}
                <button
                  onClick={() => navigateReview(1)}
                  disabled={currentReviewIndex === -1 || currentReviewIndex >= allReviews.length - 1}
                  className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                >
                  Next <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-2xl text-gray-400 mt-20">
              {allReviewsCompleted ? "All code pairs have been reviewed." : "No code pairs available for review."}
            </div>
          )}

          {(isReviewingOld || allReviewsCompleted) && (
            <div className="mt-8">
              <h3 className="text-xl font-medium text-gray-200 mb-4">All Reviews</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allReviews.map((review, index) => (
                  <button
                    key={review.id}
                    onClick={() => {
                      setCurrentReviewIndex(index);
                      fetchSpecificReview(review.id);
                    }}
                    className={`p-4 rounded-lg ${currentReviewIndex === index ? 'bg-blue-500' : 'bg-gray-700'
                      } hover:bg-blue-600 transition-colors text-left`}
                  >
                    <div className="font-medium">Review {index + 1}</div>
                    <div className="text-sm text-gray-300 truncate">{review.category}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeChangeTaxonomyBuddy;