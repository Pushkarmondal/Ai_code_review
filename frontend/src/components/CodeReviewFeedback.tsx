import React from 'react';
import { DetectLanguage } from '../utils/DetectLanguage';

interface CodeBlock {
  code: string;
  language: string;
}

// Syntax highlighting tokens
const highlightCode = (code: string, language: string) => {
  const tokens = [];
  let remaining = code;

  // Define token patterns for different languages
  const patterns = {
    keyword: getKeywordPattern(language),
    string: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
    comment: getCommentPattern(language),
    number: /\b\d+\.?\d*\b/g,
    function: /\b(\w+)(?=\s*\()/g,
    operator: /[+\-*/%=<>!&|]+/g,
    bracket: /[(){}[\]]/g,
  };

  while (remaining.length > 0) {
    let matched = false;
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (!pattern) continue;
      
      pattern.lastIndex = 0;
      const match = pattern.exec(remaining);
      
      if (match && match.index === 0) {
        if (match.index > 0) {
          tokens.push({ type: 'text', value: remaining.slice(0, match.index) });
        }
        tokens.push({ type, value: match[0] });
        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
};

function getKeywordPattern(language: string) {
  const keywords = {
    javascript: /\b(function|const|let|var|if|else|for|while|return|import|export|class|extends|async|await|try|catch|finally|typeof|instanceof)\b/g,
    typescript: /\b(function|const|let|var|if|else|for|while|return|import|export|class|extends|async|await|try|catch|finally|typeof|instanceof|interface|type|enum|public|private|protected)\b/g,
    python: /\b(def|class|if|elif|else|for|while|return|import|from|try|except|finally|with|as|lambda|yield|global|nonlocal)\b/g,
    java: /\b(public|private|protected|static|final|class|interface|extends|implements|if|else|for|while|return|try|catch|finally|new|this|super)\b/g,
    cpp: /\b(int|float|double|char|bool|void|if|else|for|while|return|class|struct|public|private|protected|virtual|static|const|namespace|using)\b/g,
  };
  return keywords[language as keyof typeof keywords] || keywords.javascript;
}

function getCommentPattern(language: string) {
  if (['python'].includes(language)) {
    return /#.*$/gm;
  }
  return /\/\/.*$|\/\*[\s\S]*?\*\//gm;
}


interface CodeReviewFeedbackProps {
  feedback: string;
  loading: boolean;
}

const CodeReviewFeedback: React.FC<CodeReviewFeedbackProps> = ({ feedback, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-500">Analyzing your code...</div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="text-gray-400 text-4xl mb-4">📝</div>
        <p className="text-lg">Your code review will appear here</p>
        <p className="text-sm mt-2">Enter some code and click "Review Code"</p>
      </div>
    );
  }

  // Function to clean and format the feedback
  const formatFeedback = (text: string) => {
    // Clean the text by removing unwanted characters and formatting
    let cleanedText = text
      // Remove markdown-style bold/italic formatting
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove dashes used for lists and separators
      .replace(/^[\s]*[-*]\s*/gm, '')
      .replace(/^[\s]*---+[\s]*$/gm, '')
      // Clean up multiple spaces and line breaks
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Extract code blocks first and auto-detect language
    const codeBlocks: CodeBlock[] = [];
    cleanedText = cleanedText.replace(/```(\w+)?\n([\s\S]*?)```/g, ( lang, code) => {
      const blockIndex = codeBlocks.length;
      const detectedLanguage = lang ? lang.toLowerCase() : DetectLanguage(code.trim());
      codeBlocks.push({
        code: code.trim(),
        language: detectedLanguage,
      });
      return `{{CODE_BLOCK_${blockIndex}}}`;
    });

    // Split by main sections (## headings)
    const sections = cleanedText.split(/#{2,}\s*(.+?)(?=\n|$)/);
    const formattedSections = [];

    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const content = sections[i + 1]?.trim();
      
      if (!title || !content) continue;

      formattedSections.push({ title, content });
    }

    // If no sections found, treat the entire text as one section
    if (formattedSections.length === 0) {
      formattedSections.push({ title: 'Code Review', content: cleanedText });
    }

    return formattedSections.map((section, sectionIndex) => {
      // Split content into paragraphs
      const paragraphs = section.content
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => p.trim());

      return (
        <div key={sectionIndex} className="mb-8">
          {section.title !== 'Code Review' && (
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-4">
              {section.title}
            </h3>
          )}
          
          <div className="space-y-4">
            {paragraphs.map((paragraph, pIndex) => {
              // Check if this paragraph contains a code block placeholder
              const codeBlockMatch = paragraph.match(/\{\{CODE_BLOCK_(\d+)\}\}/);
              
              if (codeBlockMatch) {
                const blockIndex = parseInt(codeBlockMatch[1], 10);
                const block = codeBlocks[blockIndex];
                
                if (!block) return null;

                const tokens = highlightCode(block.code, block.language);
                
                return (
                  <div key={`code-${sectionIndex}-${pIndex}`} className="my-6">
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium flex items-center justify-between">
                        <span>{block.language.toUpperCase()}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(block.code)}
                          className="text-gray-400 hover:text-gray-200 transition-colors text-xs px-2 py-1 rounded hover:bg-gray-700"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                          <code>
                            {tokens.map((token, idx) => {
                              const className = {
                                keyword: 'text-purple-400 font-semibold',
                                string: 'text-green-400',
                                comment: 'text-gray-500 italic',
                                number: 'text-blue-400',
                                function: 'text-yellow-400',
                                operator: 'text-green-400',
                                bracket: 'text-gray-300',
                                text: 'text-gray-100'
                              }[token.type] || 'text-gray-100';
                              
                              return (
                                <span key={idx} className={className}>
                                  {token.value}
                                </span>
                              );
                            })}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              }

              // Handle regular paragraphs with better formatting
              const processedParagraph = paragraph
                // Convert numbered lists to better format
                .replace(/^\d+\.\s*/gm, '• ')
                // Clean up any remaining special characters
                .replace(/[*#`]/g, '')
                .trim();

              if (!processedParagraph) return null;

              // Determine block type and styling
              const getBlockType = (text: string) => {
                const lowerText = text.toLowerCase();
              
                if (lowerText.includes('general impression')) {
                  return 'general';
                }
              
                if (
                  lowerText.includes('critical') ||
                  lowerText.includes('security') ||
                  lowerText.includes('vulnerability') ||
                  lowerText.includes('danger') ||
                  lowerText.includes('error') ||
                  lowerText.includes('bug')
                ) {
                  return 'error';
                }
              
                if (
                  lowerText.includes('warning') ||
                  lowerText.includes('caution') ||
                  lowerText.includes('problem:') ||
                  lowerText.includes('issue') ||
                  lowerText.includes('performance') ||
                  lowerText.includes('bottleneck')
                ) {
                  return 'warning';
                }
              
                if (
                  lowerText.includes('recommendation:') ||
                  lowerText.includes('good practice') ||
                  lowerText.includes('best practice') ||
                  lowerText.includes('improvement') ||
                  lowerText.includes('solution') ||
                  lowerText.includes('fix')
                ) {
                  return 'success';
                }
              
                return 'default';
              };

              const blockType = getBlockType(processedParagraph);
              
              const blockStyles = {
                general: {
                    bg: 'bg-green-50',
                    border: 'border-l-4 border-green-200',
                    icon: '✅',
                    iconBg: 'bg-green-100',
                    text: 'text-green-800'
                },                  
                error: {
                  bg: 'bg-red-50',
                  border: 'border-l-4 border-red-100',
                  icon: '🚨',
                  iconBg: 'bg-red-100',
                  text: 'text-red-800'
                },
                warning: {
                  bg: 'bg-yellow-50',
                  border: 'border-l-4 border-yellow-100',
                  icon: '⚠️',
                  iconBg: 'bg-yellow-100',
                  text: 'text-yellow-800'
                },
                success: {
                  bg: 'bg-green-50',
                  border: 'border-l-4 border-green-100',
                  icon: '✅',
                  iconBg: 'bg-green-100',
                  text: 'text-green-800'
                },
                default: {
                  bg: 'bg-gray-50',
                  border: 'border-l-4 border-gray-100',
                  icon: '📝',
                  iconBg: 'bg-gray-100',
                  text: 'text-gray-700'
                }
              };

              const style = blockStyles[blockType];
              
              return (
                <div 
                  key={`p-${sectionIndex}-${pIndex}`} 
                  className={`p-4 rounded-lg ${style.bg} ${style.border} relative`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`${style.iconBg} rounded-full p-1 flex-shrink-0 mt-0.5`}>
                      <span className="text-sm">{style.icon}</span>
                    </div>
                    <p className={`${style.text} leading-relaxed whitespace-pre-line flex-1 font-medium`}>
                      {processedParagraph}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-none">
      <div className="space-y-6">
        {formatFeedback(feedback)}
      </div>
    </div>
  );
};

export default CodeReviewFeedback;