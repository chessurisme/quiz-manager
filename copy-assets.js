import { copyFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'fs';
import { join } from 'path';

function copyDir(src, dest) {
  if (!statSync(src).isDirectory()) {
    return;
  }
  
  if (!statSync(dest).isDirectory()) {
    mkdirSync(dest, { recursive: true });
  }
  
  const items = readdirSync(src);
  items.forEach(item => {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

console.log('🚀 Starting smart asset preservation...');

// Step 1: Copy static assets from public to dist (preserving favicons, manifest, sw.js, offline.html)
console.log('📁 Copying static assets to dist...');
copyDir('public/assets/favicons', 'dist/assets/favicons');
copyFileSync('public/manifest.json', 'dist/manifest.json');
copyFileSync('public/sw.js', 'dist/sw.js');
copyFileSync('public/offline.html', 'dist/offline.html');

console.log('✅ Static assets copied to dist');

// Step 2: Copy the complete build from dist back to public (Vercel root)
console.log('🔄 Copying complete build to public for Vercel...');
copyDir('dist', 'public');

console.log('✅ Build successfully copied to public for Vercel deployment!');
console.log('🎯 Your public folder is now ready for Vercel with preserved favicons and updated build files.');
