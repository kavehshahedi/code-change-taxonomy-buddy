import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Prism from 'prismjs';
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

const CodeChangeViewer = () => {
    const [codePair, setCodePair] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      
      const fetchCodePair = async () => {
        if (!id) {
          setError('No ID provided in URL');
          setLoading(false);
          return;
        }
        
        try {
          console.log('Fetching codepair with ID:', id);
          const response = await axios.get(`/code-pairs/${id}`);
          console.log('Response:', response.data);
          
          if (response.data.success) {
            setCodePair(response.data.codePair);
          } else {
            setError('Failed to fetch code pair');
          }
        } catch (error) {
          console.error('Error fetching code pair:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchCodePair();
    }, [location]);
  
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
          <div className="text-white">Error: {error}</div>
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="container max-w-6xl">
          <UnifiedDiffViewer
            title={codePair.commitMessage?.trim() ?? ''}
            oldCode={codePair.version1 ?? ''}
            newCode={codePair.version2 ?? ''}
          />
        </div>
      </div>
    );
  };
  
  export default CodeChangeViewer;