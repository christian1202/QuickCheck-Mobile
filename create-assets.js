const fs = require('fs');
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}
const b = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('assets/icon.png', b);
fs.writeFileSync('assets/adaptive-icon.png', b);
fs.writeFileSync('assets/favicon.png', b);
console.log('Dummy assets created successfully');
