const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const screensDir = path.join(rootDir, 'src', 'screens');
const uiDir = path.join(rootDir, 'src', 'components', 'ui');
const calendarScreenPath = path.join(screensDir, 'CalendarScreen.tsx');
const settingsPath = path.join(rootDir, '.vscode', 'settings.json');
const notifPath = path.join(rootDir, 'supabase', 'functions', 'send-notification', 'index.ts');
const uiFabPath = path.join(uiDir, 'FAB.tsx');
const uiSecPath = path.join(uiDir, 'SectionHeader.tsx');

// Fix screens imports
if (fs.existsSync(screensDir)) {
  const files = fs.readdirSync(screensDir);
  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(screensDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/from '\.\.\/\.\.\/theme'/g, "from '../theme'");
      content = content.replace(/from '\.\.\/\.\.\/components\/ui'/g, "from '../components/ui'");
      content = content.replace(/from '\.\.\/\.\.\/data\/mockData'/g, "from '../data/mockData'");
      content = content.replace(/from '\.\.\/\.\.\/types'/g, "from '../types'");
      fs.writeFileSync(filePath, content);
    }
  }
}

// Fix CalendarScreen
if (fs.existsSync(calendarScreenPath)) {
  let content = fs.readFileSync(calendarScreenPath, 'utf8');
  content = content.replace(/const calendarCells = \[\];/g, "const calendarCells: (number | null)[] = [];");
  fs.writeFileSync(calendarScreenPath, content);
}

// Fix FAB and SectionHeader
[uiFabPath, uiSecPath].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/from '\.\.\/theme'/g, "from '../../theme'");
    fs.writeFileSync(filePath, content);
  }
});

// Fix send-notification
if (fs.existsSync(notifPath)) {
  let content = fs.readFileSync(notifPath, 'utf8');
  content = content.replace(/\.filter\(\(m\) =>/g, ".filter((m: any) =>");
  content = content.replace(/\.map\(\(m\) =>/g, ".map((m: any) =>");
  content = content.replace(/\.map\(\(u\) =>/g, ".map((u: any) =>");
  fs.writeFileSync(notifPath, content);
}

// Fix settings.json
if (fs.existsSync(path.dirname(settingsPath))) {
  const settingsContent = `{
  "deno.enable": true,
  "deno.enablePaths": [
    "supabase"
  ],
  "deno.lint": true,
  "deno.unstable": false
}`;
  fs.writeFileSync(settingsPath, settingsContent);
}

console.log("Fixed all issues!");
