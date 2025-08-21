# 🚀 Smart Build Process for Vercel Deployment

## Overview
This project uses a smart build strategy that preserves static assets (favicons, manifest.json, sw.js, offline.html) while building for Vercel deployment.

## 🏗️ Build Process

### 1. Development
```bash
npm run dev
```
- Serves from `src/` with static assets from `public/`
- Hot reload enabled
- Static assets served from `public/` directory

### 2. Production Build
```bash
npm run build
```
This command runs two phases:

#### Phase 1: Vite Build
- Builds your app from `src/` to `dist/`
- Generates optimized HTML, CSS, and JavaScript
- `dist/` folder contains the built application

#### Phase 2: Asset Preservation (postbuild)
- Copies static assets from `public/` to `dist/`:
  - `public/assets/favicons/` → `dist/assets/favicons/`
  - `public/manifest.json` → `dist/manifest.json`
  - `public/sw.js` → `dist/sw.js`
  - `public/offline.html` → `dist/offline.html`
- Copies complete build from `dist/` to `public/`
- `public/` is now ready for Vercel deployment

### 3. Clean Build
```bash
npm run clean
```
- Removes `dist/` folder
- Useful for fresh builds

## 📁 File Structure

### Before Build
```
public/
├── assets/
│   ├── favicons/          ← Static assets (preserved)
│   ├── index-*.js         ← Old build files
│   └── index-*.css        ← Old build files
├── manifest.json           ← Static asset (preserved)
├── sw.js                  ← Static asset (preserved)
├── offline.html           ← Static asset (preserved)
└── index.html             ← Old build file
```

### After Build
```
public/                     ← Vercel root folder
├── assets/
│   ├── favicons/          ← Preserved static assets
│   ├── index-*.js         ← New build files
│   └── index-*.css        ← New build files
├── manifest.json           ← Preserved
├── sw.js                  ← Preserved
├── offline.html           ← Preserved
└── index.html             ← New build file

dist/                      ← Build workspace (can be deleted)
├── assets/
│   ├── favicons/          ← Copied static assets
│   ├── index-*.js         ← Built files
│   └── index-*.css        ← Built files
├── manifest.json           ← Copied
├── sw.js                  ← Copied
├── offline.html           ← Copied
└── index.html             ← Built file
```

## 🎯 Vercel Deployment

1. **Build**: `npm run build`
2. **Deploy**: Push `public/` folder to Vercel
3. **Result**: All static assets preserved + latest build files

## 🔧 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build + asset preservation
- `npm run clean` - Remove build artifacts
- `npm run preview` - Preview production build

## 💡 Benefits

✅ **No asset loss** - Favicons, manifest, SW, offline page preserved  
✅ **Vercel compatible** - Uses `public/` as root folder  
✅ **Clean builds** - Builds in isolated `dist/` environment  
✅ **Automatic** - No manual file copying needed  
✅ **Cross-platform** - Works on Windows, Mac, Linux
