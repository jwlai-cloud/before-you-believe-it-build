const fs = require('fs');
const required = ['index.html', 'styles.css', 'app.js', 'README.md'];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}
const html = fs.readFileSync('index.html', 'utf8');
for (const token of ['Think', 'Push back', 'Check', 'Make', 'Own', 'LEARNING RECEIPT', 'Copy working answer', 'Print / save receipt']) {
  if (!html.includes(token)) throw new Error(`Expected activity content missing: ${token}`);
}
console.log('Static prototype checks passed.');
