const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteDir = path.join(root, 'gurraconstructionltd.co.uk');
const distDir = path.join(root, 'dist');

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

fs.rmSync(distDir, { recursive: true, force: true });
copyDir(siteDir, distDir);

copyDir(path.join(root, 'fonts.googleapis.com'), path.join(distDir, 'fonts.googleapis.com'));
copyDir(path.join(root, 'fonts.gstatic.com'), path.join(distDir, 'fonts.gstatic.com'));
fs.copyFileSync(path.join(root, 'public', 'logo.png'), path.join(distDir, 'logo.png'));

for (const file of walkFiles(distDir)) {
  if (path.extname(file).toLowerCase() !== '.html') {
    continue;
  }

  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(
    /href="(?:\.\.\/)+fonts\.googleapis\.com\//g,
    'href="/fonts.googleapis.com/'
  );

  if (updated !== original) {
    fs.writeFileSync(file, updated);
  }
}

console.log(`Static site built in ${path.relative(root, distDir)}`);
