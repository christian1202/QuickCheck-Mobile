const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const uiDir = path.join(__dirname, 'src', 'components', 'ui');

if (fs.existsSync(screensDir)) {
  const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));
  for (const f of files) {
    const fullPath = path.join(screensDir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/from '\.\.\/\.\.\/theme'/g, "from '../theme'");
    content = content.replace(/from '\.\.\/\.\.\/components\/ui'/g, "from '../components/ui'");
    content = content.replace(/from '\.\.\/\.\.\/data\/mockData'/g, "from '../data/mockData'");
    content = content.replace(/from '\.\.\/\.\.\/types'/g, "from '../types'");
    fs.writeFileSync(fullPath, content);
  }
}

if (fs.existsSync(uiDir)) {
  const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));
  for (const f of files) {
    const fullPath = path.join(uiDir, f);
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/from '\.\.\/theme'/g, "from '../../theme'");
    fs.writeFileSync(fullPath, content);
  }
}

console.log('Fixed imports!');
