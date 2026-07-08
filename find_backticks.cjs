const fs = require('fs');
const lines = fs.readFileSync('index.tsx', 'utf8').split('\n');
lines.forEach((line, index) => {
  if (line.includes('`')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
