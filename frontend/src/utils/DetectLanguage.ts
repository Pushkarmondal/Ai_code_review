// DetectLanguage.ts

interface LanguagePatterns {
  [key: string]: {
    patterns: RegExp[];
    weight: number;
  };
}

const languagePatterns: LanguagePatterns = {
  TypeScript: {
    patterns: [
      /\binterface\s+\w+/,
      /\btype\s+\w+\s*=/,
      /\benum\s+\w+/,
      /:\s*(string|number|boolean|any|void|unknown|undefined|null)\b/,
      /\b(?:const|let|var)\s+\w+\s*:\s*\w+/,
      /<[\w\s,]+>\s*[\w[\]{}:;=<>]*(?:\s*\w+\s*:)/,
      /\bPromise<[^>]+>/,
    ],
    weight: 2
  },
  JavaScript: {
    patterns: [
      /\b(function|const|let|var|=>)\s*[\w$]*\s*[=:]/,
      /\b(console\.log|document\.|window\.|module\.exports|require\()/,
      /\b(import|export)\s+[\w{*][\s\S]*?\s+from\s+['"].*['"]/,
      /\b(?:async\s+)?function[\s*]\s*[\w$]*\s*\([^)]*\)/,
      /\bclass\s+\w+\s*{/,
    ],
    weight: 1.5
  },
  Python: {
    patterns: [
      /^\s*(?:def|class)\s+\w+\s*[(:]/m,
      /^\s*(?:from|import)\s+[\w.]+\s+(?:import\s+[\w*,\s]+)?/m,
      /\b(?:print|input|def|class|if\s+__name__\s*==\s*['"]__main__['"])\b/,
      /\b(?:elif|lambda|yield|with\s+as|try|except|finally|raise)\b/,
      /\b(?:True|False|None)\b/,
    ],
    weight: 2
  },
  Java: {
    patterns: [
      /\b(?:public|private|protected|static|final|native|synchronized|abstract|transient)\b/,
      /\b(?:class|interface|enum|extends|implements|throws|new)\s+\w+/,
      /\b(?:int|long|char|byte|boolean|float|double|void|String)\s+\w+\s*[;=]/,
      /\bSystem\.(?:out|err)\.(?:print(?:ln)?|printf?)\s*\(/,
      /\b(?:try\s*\{|catch\s*\(|finally\s*\{|throw\s+\w+;)/,
    ],
    weight: 2
  },
  'C++': {
    patterns: [
      /#include\s*[<"]\w+(\.h(pp)?)?[>"]/,
      /using\s+namespace\s+\w+\s*;/,
      /\b(?:int|void|double|float|char|bool|auto)\s+[\w:]+\s*[;=(]/,
      /\b(?:std::|#include\s*<\w+>)/,
      /\b(?:cout|cin|endl|new|delete)\b/,
      /\b(?:class|struct|namespace|template\s*<[^>]*>)\s+\w+/,
    ],
    weight: 2
  },
  HTML: {
    patterns: [
      /<\/?[a-z][^>]*>/i,
      /<(!doctype|html|head|title|body|div|span|p|a|img|script|style|link|meta|form|input|button|ul|ol|li|table|tr|td|th|thead|tbody|tfoot)>/i,
      /<\w+[^>]*\s+[a-z-]+=("[^"]*"|'[^']*')/i,
      /&[a-z]+;/i,
    ],
    weight: 3
  },
  CSS: {
    patterns: [
      /\.[\w-]+\s*\{/,
      /#[a-fA-F0-9]{3,6}\b/,
      /\b(margin|padding|color|background|font|border|width|height):[^;\n]+;/,
      /@(media|keyframes|import|font-face|supports)\b/,
      /\b(?:px|em|rem|vh|vw|%|!important)\b/,
    ],
    weight: 2
  }, 
  Rust: {
    patterns: [
      /\b(fn|let|mut|struct|enum|impl|trait|match|pub|crate|super)\b/,
      /\buse\s+[\w:]+;/,
      /::\w+\s*\(/,
      /#\(/,
      /\bSelf\b/,
    ],
    weight: 2
  },

  Solidity: {
    patterns: [
      /\b(contract|pragma|import|function|returns|event|emit|mapping|address|msg\.sender|require|modifier)\b/,
      /\b(uint|int|string|address|bool)(\d{0,3})?\b/,
      /\bmemory|storage|calldata\b/,
      /\/\/ SPDX-License-Identifier:/,
      /\bconstructor\s*\(/,
    ],
    weight: 2
  },

  Go: {
    patterns: [
      /\bfunc\s+\w+\s*\(/,
      /\bpackage\s+\w+/,
      /\bimport\s+\(/,
      /\bdefer|go\s+\w+\(/,
      /\bchan|map|interface|struct\b/,
    ],
    weight: 2
  },

  Ruby: {
    patterns: [
      /\b(def|class|module|end|puts|require|include|unless|elsif|begin|rescue|ensure)\b/,
      /@[a-z_]\w*/,
      /\b[a-z_]\w*(!|\?)\b/,
      /:\w+\s*=>/,
    ],
    weight: 2
  },

  PHP: {
    patterns: [
      /<\?php/,
      /\bfunction\s+\w+\(/,
      /\$\w+/,
      /\b(?:echo|print|require|include|namespace|use)\b/,
      /\bclass\s+\w+\s*\{/,
    ],
    weight: 2
  }
};

export function DetectLanguage(code: string): string {
  const scores: Record<string, number> = {};
  const lines = code.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) return 'Text';
  
  // Check for specific file signatures first
  if (/^<\?xml\s+version=/.test(code)) return 'XML';
  if (/^<!(?i:doctype\s+html\s*)>/.test(code.trim())) return 'HTML';
  if (/^\s*#!\/.*\b(node|python|ruby|perl|bash|sh|zsh|fish)\b/.test(lines[0])) {
    const shebang = lines[0].toLowerCase();
    if (shebang.includes('node')) return 'JavaScript';
    if (shebang.includes('python')) return 'Python';
    if (shebang.includes('ruby')) return 'Ruby';
    if (shebang.includes('perl')) return 'Perl';
    if (shebang.includes('bash') || shebang.includes('sh') || 
        shebang.includes('zsh') || shebang.includes('fish')) return 'Shell';
  }

  // Score each language based on pattern matches
  for (const [lang, { patterns, weight }] of Object.entries(languagePatterns)) {
    let score = 0;
    
    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        // More matches = higher score
        score += matches.length * weight;
      }
    }
    
    if (score > 0) {
      scores[lang] = score;
    }
  }

  // Find the language with the highest score
  let maxScore = 0;
  let detectedLang = 'Text';
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // If we have a clear winner, return it
  if (maxScore >= 3) {
    return detectedLang;
  }

  // For very short code snippets, be more lenient
  if (code.length < 100 && maxScore > 0) {
    return detectedLang;
  }

  // Default to JavaScript if nothing else matches
  return maxScore > 0 ? detectedLang : 'JavaScript';
}
  