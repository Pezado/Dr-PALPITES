const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

// We replace occurrences where the closing backtick is missing
content = content.replace(
  /className=\{\`text-\[11px\] font-black uppercase italic tracking-tighter leading-tight \$\{isDarkMode \? 'text-white' : 'text-slate-900'\}\}/g,
  'className={isDarkMode ? "text-[11px] font-black uppercase italic tracking-tighter leading-tight text-white" : "text-[11px] font-black uppercase italic tracking-tighter leading-tight text-slate-900"}'
);

content = content.replace(
  /className=\{\`text-\[10px\] font-black uppercase italic tracking-tighter \$\{isDarkMode \? 'text-white' : 'text-slate-600'\}\}/g,
  'className={isDarkMode ? "text-[10px] font-black uppercase italic tracking-tighter text-white" : "text-[10px] font-black uppercase italic tracking-tighter text-slate-600"}'
);

content = content.replace(
  /className=\{\`ml-2 text-\[9px\] \$\{isDarkMode \? 'text-white\/50' : 'text-slate-400'\}\}/g,
  'className={isDarkMode ? "ml-2 text-[9px] text-white/50" : "ml-2 text-[9px] text-slate-400"}'
);

fs.writeFileSync('index.tsx', content, 'utf8');
console.log('Script completed successfully!');
