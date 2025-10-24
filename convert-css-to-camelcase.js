// convert-css-to-camelcase.js (FIXED VERSION)
import fs from 'fs';

const cssFile = 'src/pages/calls.css';
const cssContent = fs.readFileSync(cssFile, 'utf8');

// Find all class names in the CSS
const classNames = new Set();
const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
let match;

while ((match = classRegex.exec(cssContent)) !== null) {
 classNames.add(match[1]);
}

// Create mapping from kebab-case to camelCase
const mapping = {};
classNames.forEach(className => {
 // Convert ALL hyphens followed by any character (letter or number) to camelCase
 const camelCase = className.replace(/-([a-z0-9])/gi, (g) => g[1].toUpperCase());

 if (className !== camelCase) {
  mapping[className] = camelCase;
 }
});

// Replace all class names in CSS
let newCssContent = cssContent;
Object.entries(mapping).forEach(([kebab, camel]) => {
 // Replace .class-name with .className
 const regex = new RegExp(`\\.${kebab.replace(/[-]/g, '\\-')}(?![a-zA-Z0-9_-])`, 'g');
 newCssContent = newCssContent.replace(regex, `.${camel}`);
});

// Save the converted CSS
fs.writeFileSync('src/pages/calls.module.css', newCssContent);

// Save the mapping for reference
fs.writeFileSync('class-name-mapping.json', JSON.stringify(mapping, null, 2));

console.log(`✓ Converted ${Object.keys(mapping).length} class names`);
console.log('✓ Created: src/index.module.css');
console.log('✓ Mapping saved to: class-name-mapping.json');