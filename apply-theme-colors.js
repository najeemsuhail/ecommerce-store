const fs = require('fs');
const path = require('path');

const replacements = {
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary-hover',
  'hover:text-blue-600': 'hover:text-primary',
  'hover:text-blue-700': 'hover:text-primary-hover',
  'bg-blue-600': 'bg-primary',
  'hover:bg-blue-700': 'hover:bg-primary-hover',
  'bg-blue-100': 'bg-primary/20',
  'hover:bg-blue-100': 'hover:bg-primary/20',
  'focus:ring-blue-500': 'focus:ring-primary',
  'border-blue-600': 'border-primary',
  'border-blue-500': 'border-primary',
  'bg-red-500': 'bg-danger',
  'text-red-500': 'text-danger',
  'text-red-600': 'text-danger',
  'text-gray-700': 'text-text-light',
  'text-gray-900': 'text-text-dark',
  'text-gray-600': 'text-text-light',
  'text-gray-500': 'text-text-lighter',
  'text-gray-400': 'text-text-lighter',
  'text-gray-800': 'text-text-dark',
  'bg-gray-50': 'bg-bg-gray',
  'bg-gray-100': 'bg-bg-gray',
  'bg-gray-200': 'bg-bg-gray',
  'hover:bg-gray-100': 'hover:bg-bg-gray',
  'border-gray-100': 'border-border-color',
  'border-gray-300': 'border-border-color',
  'border-gray-200': 'border-border-color',
};

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx')) {
      console.log(`Processing ${filePath}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      Object.keys(replacements).forEach(old => {
        const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, replacements[old]);
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

walkDir('src');
console.log('✅ All color replacements completed!');
