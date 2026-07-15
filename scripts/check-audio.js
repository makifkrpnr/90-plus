'use strict';

const fs = require('node:fs');
const path = require('node:path');

require(path.join(__dirname, '..', 'js', 'audio.js'));

const manifest = globalThis.GameAudio?.manifest || {};
const base = path.join(__dirname, '..', 'assets', 'audio');
const found = [];
const missing = [];

for (const [key, relativePath] of Object.entries(manifest)) {
  const fullPath = path.join(base, relativePath);
  (fs.existsSync(fullPath) ? found : missing).push({ key, relativePath });
}

console.log(`\n90+ ses kontrolü: ${found.length}/${Object.keys(manifest).length} dosya hazır.\n`);

if (found.length) {
  console.log('HAZIR');
  found.forEach(item => console.log(`  ✓ ${item.relativePath}`));
  console.log('');
}

if (missing.length) {
  console.log('EKSİK — oyun bu dosyalar olmadan sessizce devam eder');
  missing.forEach(item => console.log(`  · ${item.relativePath}`));
  console.log('');
}
