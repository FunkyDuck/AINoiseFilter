const fs = require('fs');
const path = require('path');

const target = process.argv[2];
const manifestFile = target === 'firefox' ? 'manifest.v2.json' : 'manifest.v3.json';

if(!target || (target !== 'firefox' && target !== 'chrome')) {
    console.error("Utilisation : node switch-manifest.js firefox|chrome");
    process.exit(1);
}

fs.copyFileSync(
    path.join(__dirname, manifestFile),
    path.join(__dirname, 'manifest.json')
);

console.log(`Manifest pour ${target} prêt (=> manifest.json)`);