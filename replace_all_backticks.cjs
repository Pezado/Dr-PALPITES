const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

// Regex to capture className={`TEXT1 ${isDarkMode ? 'CLASS1' : 'CLASS2'} TEXT2`}
// We support both backticks ending with `}` and those ending without the backtick (unclosed template string bug)
const regexCorrect = /className=\{\`([^\$]*)\s*\$\{isDarkMode\s*\?\s*'([^']*)'\s*:\s*'([^']*)'\}\s*([^\`]*)\`\}/g;
const regexUnclosed = /className=\{\`([^\$]*)\s*\$\{isDarkMode\s*\?\s*'([^']*)'\s*:\s*'([^']*)'\}\s*([^\`}]*)\}/g;

let countCorrect = 0;
content = content.replace(regexCorrect, (match, text1, class1, class2, text2) => {
  countCorrect++;
  const t1 = text1.trim();
  const t2 = text2.trim();
  const c1 = class1.trim();
  const c2 = class2.trim();
  const darkClasses = [t1, c1, t2].filter(Boolean).join(' ');
  const lightClasses = [t1, c2, t2].filter(Boolean).join(' ');
  return `className={isDarkMode ? "${darkClasses}" : "${lightClasses}"}`;
});

let countUnclosed = 0;
content = content.replace(regexUnclosed, (match, text1, class1, class2, text2) => {
  countUnclosed++;
  const t1 = text1.trim();
  const t2 = text2.trim();
  const c1 = class1.trim();
  const c2 = class2.trim();
  const darkClasses = [t1, c1, t2].filter(Boolean).join(' ');
  const lightClasses = [t1, c2, t2].filter(Boolean).join(' ');
  return `className={isDarkMode ? "${darkClasses}" : "${lightClasses}"}`;
});

fs.writeFileSync('index.tsx', content, 'utf8');
console.log(`Successfully converted ${countCorrect} correct and ${countUnclosed} unclosed backticks to clean double quotes!`);
