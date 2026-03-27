const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'components', 'ui');

if (fs.existsSync(uiDir)) {
  const files = fs.readdirSync(uiDir);
  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(uiDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix imports for theme
      const newContent = content.replace(/from '\.\.\/theme'/g, "from '../../theme'");
      
      // Might also need to fix types if it imports from '../types' instead of '../../types'
      // Let's also preemptively fix that just in case:
      // content = content.replace(/from '\.\.\/types'/g, "from '../../types'");
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Fixed ${file}`);
      }
    }
  }
}
console.log("Finished updating UI components!");
