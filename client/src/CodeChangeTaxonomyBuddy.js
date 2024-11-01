import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LogOut, ChevronLeft, ChevronRight, Edit, Check, X } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css';
import { diffLines } from 'unidiff';

const DashboardCard = ({ title, value, subValue, color }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <div className="flex justify-between items-center mb-2">
      <div className="text-gray-400">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
    <div className="text-xs text-gray-500">{subValue}</div>
  </div>
);

const UnifiedDiffViewer = ({ title, oldCode, newCode }) => {
  const CONTEXT_LINES = 3;
  const COLLAPSE_THRESHOLD = 6;

  useEffect(() => {
    const highlightCode = () => {
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    };

    highlightCode();
  }, [oldCode, newCode]);

  const getUniqueKey = (index, lineNumber, type) => `${type}-${index}-${lineNumber}`;

  const renderLine = (line, lineType, oldLine, newLine, bgColor = '', index) => {
    const uniqueKey = getUniqueKey(index, oldLine || newLine, lineType === '+' ? 'added' : lineType === '-' ? 'removed' : 'unchanged');

    return (
      <div
        key={uniqueKey}
        className={`flex text-[13px] m-0 ${bgColor}`}
      >
        <div className={`text-white w-8 ${bgColor.replace('30', '40')} flex flex-shrink-0 items-center justify-center select-none m-0 py-[1px] border-gray-600`}>
          {oldLine}
        </div>
        <div className={`text-white w-8 ${bgColor.replace('30', '40')} flex flex-shrink-0 items-center justify-center select-none m-0 py-[1px] border-gray-600`}>
          {newLine}
        </div>
        <pre className="m-0 px-0 py-[1px] flex-1 overflow-x-auto leading-0"
          style={{ background: 'transparent', margin: 3, padding: '0px', fontWeight: 'bolder' }}>
          <span className="text-white m-0 mr-2 select-none px-2 font-bold">{lineType}</span>
          <code className="language-java font-bold m-0" style={{ filter: 'brightness(1.1)' }}>{line}</code>
        </pre>
      </div>
    );
  };

  const generateDiff = () => {
    const diff = diffLines(oldCode, newCode);
    let oldLineNumber = 1;
    let newLineNumber = 1;

    const processedDiff = [];

    diff.forEach((change, changeIndex) => {
      const lines = change.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();

      if (!change.added && !change.removed) {
        // Handle unchanged lines
        if (lines.length > COLLAPSE_THRESHOLD) {
          // Show first CONTEXT_LINES
          lines.slice(0, CONTEXT_LINES).forEach(line => {
            processedDiff.push({
              type: 'unchanged',
              line,
              oldLine: oldLineNumber++,
              newLine: newLineNumber++
            });
          });

          // Add collapse indicator
          const skippedLines = lines.length - (CONTEXT_LINES * 2);
          if (skippedLines > 0) {
            processedDiff.push({
              type: 'collapse',
              skippedLines,
              oldLineStart: oldLineNumber,
              newLineStart: newLineNumber
            });
            oldLineNumber += skippedLines;
            newLineNumber += skippedLines;
          }

          // Show last CONTEXT_LINES
          lines.slice(-CONTEXT_LINES).forEach(line => {
            processedDiff.push({
              type: 'unchanged',
              line,
              oldLine: oldLineNumber++,
              newLine: newLineNumber++
            });
          });
        } else {
          // Show all lines if section is small
          lines.forEach(line => {
            processedDiff.push({
              type: 'unchanged',
              line,
              oldLine: oldLineNumber++,
              newLine: newLineNumber++
            });
          });
        }
      } else {
        // Handle changed lines
        lines.forEach(line => {
          if (change.added) {
            processedDiff.push({
              type: 'added',
              line,
              oldLine: null,
              newLine: newLineNumber++
            });
          } else {
            processedDiff.push({
              type: 'removed',
              line,
              oldLine: oldLineNumber++,
              newLine: null
            });
          }
        });
      }
    });

    return (
      <div className="font-mono text-sm leading-none [&>div]:-my-[0px]">
        {processedDiff.map((item, index) => {
          if (item.type === 'collapse') {
            return (
              <div
                key={`collapse-${item.oldLineStart}-${item.newLineStart}`}
                className="flex text-[13px] m-0 bg-gray-700/20"
              >
                <div className="text-white w-8 flex flex-shrink-0 items-center justify-center select-none m-0 py-[1px] border-gray-600">
                  ⋮
                </div>
                <div className="text-white w-8 flex flex-shrink-0 items-center justify-center select-none m-0 py-[1px] border-gray-600">
                  ⋮
                </div>
                <pre className="m-0 px-0 py-[1px] flex-1 overflow-x-auto leading-0"
                  style={{ background: 'transparent', margin: 3, padding: '0px' }}>
                  <span className="text-gray-400 m-0 mr-2 select-none px-2 italic">
                    {`... ${item.skippedLines} unchanged lines ...`}
                  </span>
                </pre>
              </div>
            );
          }

          let bgColor = '';
          let linePrefix = ' ';

          if (item.type === 'added') {
            bgColor = 'bg-green-600/30';
            linePrefix = '+';
          } else if (item.type === 'removed') {
            bgColor = 'bg-red-600/30';
            linePrefix = '-';
          }

          return renderLine(item.line, linePrefix, item.oldLine, item.newLine, bgColor, index);
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-700">
        <h3 className="text-lg font-bold font-large text-gray-200 pb-2">Message</h3>
        <h3 className="font-medium text-gray-200 whitespace-pre-line">{title}</h3>
      </div>
      <div className="overflow-auto">
        {generateDiff()}
      </div>
    </div>
  );
};

const CategoryButton = ({ category, isSelected, onClick, disabled, onRemove, showRemove }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group ${
      isSelected
        ? 'bg-blue-500 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} w-full`}
  >
    <span>{category}</span>
    {showRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    )}
  </button>
);

const CodeChangeTaxonomyBuddy = ({ username, userId, onLogout }) => {
  const [currentReview, setCurrentReview] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, remaining: 0 });
  const [allReviews, setAllReviews] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(-1);
  const [isReviewingOld, setIsReviewingOld] = useState(false);
  const [allReviewsCompleted, setAllReviewsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isFunctionalityChange, setIsFunctionalityChange] = useState(false);

  const categories = [
    "Algorithmic Change",
    "Control Flow/Loop Changes",
    "Data Structure & Variable Changes",
    "Refactoring & Code Cleanup",
    "Exception & Input/Output Handling",
    "Concurrency/Parallelism",
    "API/Library Call Changes",
    "Security Fix"
  ];

  const fetchSpecificReview = async (reviewId) => {
    try {
      const response = await axios.get(`/reviews/review/${userId}/${reviewId}`);
      if (response.data.success) {
        setCurrentReview(response.data.review);
        setIsFunctionalityChange(response.data.review.isFunctionalityChange || false);
        setIsReviewingOld(true);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error fetching specific review:', error);
    }
  };

  const handleCategorySelect = (category) => {
    if (isReviewingOld && !isEditing) return;

    if (category === "Other") {
      if (!customCategories.includes(customCategory) && customCategory.trim()) {
        setCustomCategories([...customCategories, customCategory.trim()]);
        setSelectedCategories([...selectedCategories, customCategory.trim()]);
        setCustomCategory('');
      }
    } else {
      if (!selectedCategories.includes(category)) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
  };

  const removeCategory = (indexToRemove) => {
    setSelectedCategories(selectedCategories.filter((_, index) => index !== indexToRemove));
  };

  const submitReview = async () => {
    if (!currentReview || selectedCategories.length === 0) return;

    try {
      if (isReviewingOld) {
        await axios.put(`/reviews/${currentReview.id}`, {
          categories: selectedCategories,
          isFunctionalityChange
        });
        setIsEditing(false);
      } else {
        await axios.post(`/reviews/submit`, {
          userId,
          codePairId: currentReview.codePair.id,
          categories: selectedCategories,
          isFunctionalityChange
        });
      }
      fetchNextOrLatestReview();
      fetchAllReviews();
      fetchProgress();
      setCustomCategory('');
      setCustomCategories([]);
      setSelectedCategories([]);
      setIsFunctionalityChange(false);

      const container = document.querySelector('.flex-1.p-8.overflow-auto');
      if (container) {
        container.scrollTo({ top: 0 });
      }
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

  const fetchNextOrLatestReview = useCallback(async () => {
    try {
      const response = await axios.get(`/reviews/next-or-latest/${userId}`);
      if (response.data.success) {
        if (response.data.type === 'new') {
          setCurrentReview({
            codePair: response.data.codePair,
            category: null,
          });
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
  }, [userId]);

  const fetchAllReviews = useCallback(async () => {
    try {
      const response = await axios.get(`/reviews/user/${userId}`);
      if (response.data.success) {
        setAllReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching all reviews:', error);
    }
  }, [userId]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await axios.get(`/reviews/progress/${userId}`);
      if (response.data.success) {
        setProgress(response.data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNextOrLatestReview();
    fetchAllReviews();
    fetchProgress();
  }, [fetchNextOrLatestReview, fetchAllReviews, fetchProgress]);

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
              <div className="mb-6">
                <UnifiedDiffViewer
                  title={currentReview.codePair.commitMessage.trim()}
                  oldCode={currentReview.codePair.version1}
                  newCode={currentReview.codePair.version2}
                />
              </div>
  
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center justify-between flex-1">
                    <h3 className="text-lg font-medium text-gray-200">
                      {isReviewingOld && !isEditing ? "Selected Categories" : "Select Categories"}
                    </h3>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isFunctionalityChange}
                            onChange={(e) => setIsFunctionalityChange(e.target.checked)}
                            disabled={isReviewingOld && !isEditing}
                            className="peer h-4 w-4 appearance-none rounded border border-gray-600 checked:bg-blue-500 checked:border-blue-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-white peer-checked:opacity-100 opacity-0 pointer-events-none">
                            <Check size={14} />
                          </div>
                        </div>
                        <span className="ml-2 text-gray-200">Functionality Change?</span>
                      </label>
                      {isReviewingOld && (
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="text-blue-400 hover:text-blue-300 focus:outline-none"
                        >
                          {isEditing ? <Check size={20} /> : <Edit size={20} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
  
                {selectedCategories.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-2">Selected Categories (in order):</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((category, index) => (
                        <div key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <span>{index + 1}. {category}</span>
                          {(!isReviewingOld || isEditing) && (
                            <button
                              onClick={() => removeCategory(index)}
                              className="hover:text-white focus:outline-none"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
  
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <CategoryButton
                      key={category}
                      category={category}
                      isSelected={selectedCategories.includes(category)}
                      onClick={() => handleCategorySelect(category)}
                      disabled={isReviewingOld && !isEditing}
                      showRemove={selectedCategories.includes(category)}
                      onRemove={() => removeCategory(selectedCategories.indexOf(category))}
                    />
                  ))}
                </div>
  
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    disabled={isReviewingOld && !isEditing}
                  />
                  <button
                    onClick={() => handleCategorySelect("Other")}
                    disabled={!customCategory.trim() || (isReviewingOld && !isEditing)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Custom
                  </button>
                </div>
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
                    disabled={selectedCategories.length === 0}
                    className={`px-6 py-2 rounded-full text-white font-medium ${
                      selectedCategories.length > 0
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
                    className={`p-4 rounded-lg ${
                      currentReviewIndex === index ? 'bg-blue-500' : 'bg-gray-700'
                    } hover:bg-blue-600 transition-colors text-left`}
                  >
                    <div className="font-medium">Review {index + 1}</div>
                    <div className="text-sm text-gray-300 truncate">
                      {Array.isArray(review.categories) 
                        ? review.categories.join(', ')
                        : review.categories}
                    </div>
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