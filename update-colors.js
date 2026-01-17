#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const colorMappings = [
  // Blue colors to primary
  ['bg-blue-600', 'bg-primary'],
  ['bg-blue-400', 'bg-primary/70'],
  ['bg-blue-100', 'bg-primary/20'],
  ['text-blue-600', 'text-primary'],
  ['text-blue-800', 'text-primary-dark'],
  ['text-blue-700', 'text-primary-hover'],
  ['hover:text-blue-600', 'hover:text-primary'],
  ['hover:bg-blue-600', 'hover:bg-primary'],
  ['hover:border-blue-600', 'hover:border-primary'],
  ['hover:border-blue-500', 'hover:border-primary'],
  ['hover:text-blue-700', 'hover:text-primary-hover'],
  ['hover:bg-blue-700', 'hover:bg-primary-hover'],
  ['border-blue-600', 'border-primary'],
  ['border-blue-500', 'border-primary'],
  ['border-blue-400', 'border-primary'],
  ['focus:ring-blue-500', 'focus:ring-primary'],
  ['focus:border-blue-500', 'focus:border-primary'],
  
  // Red to danger
  ['bg-red-100', 'bg-danger/20'],
  ['bg-red-500', 'bg-danger'],
  ['bg-red-600', 'bg-danger'],
  ['text-red-600', 'text-danger'],
  ['text-red-500', 'text-danger'],
  ['border-red-500', 'border-danger'],
  ['border-red-300', 'border-danger/30'],
  ['hover:border-red-500', 'hover:border-danger'],
  ['hover:text-red-600', 'hover:text-danger'],
  ['hover:text-red-500', 'hover:text-danger'],
  
  // Gray text to text colors
  ['text-gray-900', 'text-text-dark'],
  ['text-gray-800', 'text-text-dark'],
  ['text-gray-700', 'text-text-light'],
  ['text-gray-600', 'text-text-light'],
  ['text-gray-500', 'text-text-lighter'],
  ['text-gray-400', 'text-text-lighter'],
  
  // Gray backgrounds
  ['bg-gray-50', 'bg-bg-gray'],
  ['bg-gray-100', 'bg-bg-gray'],
  ['bg-gray-200', 'bg-bg-gray'],
  ['hover:bg-gray-100', 'hover:bg-bg-gray'],
  ['hover:bg-gray-200', 'hover:bg-bg-gray'],
  ['hover:bg-gray-50', 'hover:bg-bg-gray'],
  
  // Gray borders
  ['border-gray-100', 'border-border-color'],
  ['border-gray-200', 'border-border-color'],
  ['border-gray-300', 'border-border-color'],
  ['border-gray-400', 'border-border-color'],
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [oldColor, newColor] of colorMappings) {
      const regex = new RegExp(`\\b${oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newColor);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += walkDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (processFile(fullPath)) count++;
    }
  });

  return count;
}

console.log('🎨 Applying theme colors to all files...\n');
const updated = walkDir('src');
console.log(`\n✨ Done! Updated ${updated} files`);
