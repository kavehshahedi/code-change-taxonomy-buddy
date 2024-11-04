import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Prism from 'prismjs';
import { Check, X } from 'lucide-react';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css';
import { diffLines } from 'unidiff';

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
        if (lines.length > COLLAPSE_THRESHOLD) {
          lines.slice(0, CONTEXT_LINES).forEach(line => {
            processedDiff.push({
              type: 'unchanged',
              line,
              oldLine: oldLineNumber++,
              newLine: newLineNumber++
            });
          });

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

          lines.slice(-CONTEXT_LINES).forEach(line => {
            processedDiff.push({
              type: 'unchanged',
              line,
              oldLine: oldLineNumber++,
              newLine: newLineNumber++
            });
          });
        } else {
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

const CategoryButton = ({ category, isSelected, onClick, onRemove }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group ${
        isSelected
          ? 'bg-blue-500 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      } w-full`}
    >
      <span>{category}</span>
      {isSelected && (
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

const Validator = ({userId}) => {
    const [codePair, setCodePair] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [customCategory, setCustomCategory] = useState('');
    const [previousCategories, setPreviousCategories] = useState([]);
    const [isFunctionalityChange, setIsFunctionalityChange] = useState(false);
    const location = useLocation();
  
    // Get URL parameters
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const targetUserId = params.get('targetUserId');
  
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
    
    useEffect(() => {
      const fetchData = async () => {
        if (!id) {
          setError('No ID provided in URL');
          setLoading(false);
          return;
        }
  
        if (!targetUserId) {
          setError('No User ID provided in URL');
          setLoading(false);
          return;
        }
        
        try {
          const codePairResponse = await axios.get(`/reviews/review/${targetUserId}/${id}?type=codePairId`);
          console.log('Code Pair Response:', codePairResponse.data);
          setCodePair(codePairResponse.data.review.codePair);
          setPreviousCategories(codePairResponse.data.review.categories);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [id, targetUserId]);
  
    const handleCategorySelect = (category) => {
      if (!selectedCategories.includes(category)) {
        setSelectedCategories([...selectedCategories, category]);
      }
    };
  
    const handleCustomCategoryAdd = () => {
      if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
        setSelectedCategories([...selectedCategories, customCategory.trim()]);
        setCustomCategory('');
      }
    };
  
    const removeCategory = (indexToRemove) => {
      setSelectedCategories(selectedCategories.filter((_, index) => index !== indexToRemove));
    };
  
    const handleSubmit = async () => {
      if (!userId) {
        alert('No user ID provided');
        return;
      }
  
      try {
        await axios.post(`/reviews/submit`, {
          userId,
          codePairId: id,
          categories: selectedCategories,
          isFunctionalityChange
        });
        alert('Review submitted successfully!');
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review');
      }
    };
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      );
    }
  
    if (!codePair) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">No code pair found</div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="container max-w-6xl mx-auto">
          {/* Code Diff Viewer */}
          <UnifiedDiffViewer
            title={codePair.commitMessage?.trim() ?? ''}
            oldCode={codePair.version1 ?? ''}
            newCode={codePair.version2 ?? ''}
          />
  
          {/* Previous Categories */}
          {(
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-200 mb-2">Nominated Categories</h3>
              <div className="flex flex-wrap gap-2">
                {previousCategories.map((category, index) => (
                  <div key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                    {category}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Category Selection */}
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-200">Select Categories</h3>
              <label className="inline-flex items-center">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isFunctionalityChange}
                    onChange={(e) => setIsFunctionalityChange(e.target.checked)}
                    className="peer h-4 w-4 appearance-none rounded border border-gray-600 checked:bg-blue-500 checked:border-blue-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white peer-checked:opacity-100 opacity-0 pointer-events-none">
                    <Check size={14} />
                  </div>
                </div>
                <span className="ml-2 text-gray-200">Functionality Change?</span>
              </label>
            </div>
  
            {selectedCategories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm text-gray-400 mb-2">Selected Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category, index) => (
                    <div key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <span>{index + 1}. {category}</span>
                      <button
                        onClick={() => removeCategory(index)}
                        className="hover:text-white focus:outline-none"
                      >
                        <X size={14} />
                      </button>
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
              />
              <button
                onClick={handleCustomCategoryAdd}
                disabled={!customCategory.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Custom
              </button>
            </div>
  
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={selectedCategories.length === 0}
                className={`px-6 py-2 rounded-full text-white font-medium ${
                  selectedCategories.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Validator;