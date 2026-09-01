import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

const mappings = [
  { search: /bg-\[#0B0F19\]/g, replace: 'bg-slate-50' },
  { search: /bg-\[#111827\]/g, replace: 'bg-white' },
  { search: /bg-\[#060B14\]/g, replace: 'bg-slate-100' },
  { search: /bg-black/g, replace: 'bg-slate-100' },
  { search: /text-white/g, replace: 'text-slate-900' },
  { search: /text-gray-400/g, replace: 'text-slate-500' },
  { search: /text-gray-300/g, replace: 'text-slate-600' },
  { search: /text-gray-500/g, replace: 'text-slate-400' },
  { search: /text-\[#00F2FE\]/g, replace: 'text-cyan-600' },
  { search: /bg-\[#00F2FE\]/g, replace: 'bg-cyan-600' },
  { search: /border-white\/10/g, replace: 'border-slate-200' },
  { search: /border-white\/5/g, replace: 'border-slate-100' },
  { search: /border-white\/20/g, replace: 'border-slate-300' },
  { search: /border-\[#00F2FE\]\/30/g, replace: 'border-cyan-200' },
  { search: /border-\[#00F2FE\]\/20/g, replace: 'border-cyan-200' },
  { search: /border-\[#00F2FE\]\/50/g, replace: 'border-cyan-300' },
  { search: /bg-white\/5/g, replace: 'bg-slate-100' },
  { search: /bg-white\/10/g, replace: 'bg-slate-200' },
  { search: /bg-black\/20/g, replace: 'bg-slate-100' },
  { search: /bg-black\/40/g, replace: 'bg-slate-200' },
  { search: /bg-black\/60/g, replace: 'bg-slate-300' },
  { search: /bg-black\/80/g, replace: 'bg-white/80' },
  { search: /#00F2FE/g, replace: '#0891b2' },
  { search: /#111827/g, replace: '#ffffff' },
  { search: /#374151/g, replace: '#e2e8f0' },
  { search: /#9CA3AF/g, replace: '#64748B' },
  { search: /#060B14/g, replace: '#f1f5f9' },
  { search: /#0B0F19/g, replace: '#f8fafc' },
  { search: /dark_nolabels/g, replace: 'light_all' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Specifically target Recharts ticks which use fill
      content = content.replace(/fill: '#9CA3AF'/g, "fill: '#64748B'");

      for (const map of mappings) {
        content = content.replace(map.search, map.replace);
      }
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDirectory(SRC_DIR);
console.log('Migration completed.');
