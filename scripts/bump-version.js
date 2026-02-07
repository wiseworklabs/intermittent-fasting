#!/usr/bin/env node
/**
 * Version bump script
 * Usage: node scripts/bump-version.js [major|minor|patch]
 * Default: patch (x.x.X)
 */

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../public/version.json');
const topBarFile = path.join(__dirname, '../app/components/TopBar.tsx');

// Read current version
let versionData;
try {
    versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
} catch {
    versionData = { version: '1.0.0' };
}

const [major, minor, patch] = versionData.version.split('.').map(Number);
const bumpType = process.argv[2] || 'patch';

let newVersion;
switch (bumpType) {
    case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
    case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
    case 'patch':
    default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
}

// Update version.json
const newVersionData = {
    version: newVersion,
    buildTime: new Date().toISOString()
};
fs.writeFileSync(versionFile, JSON.stringify(newVersionData, null, 2) + '\n');

// Update TopBar.tsx
let topBarContent = fs.readFileSync(topBarFile, 'utf8');
topBarContent = topBarContent.replace(
    /const APP_VERSION = "[^"]+";/,
    `const APP_VERSION = "${newVersion}";`
);
fs.writeFileSync(topBarFile, topBarContent);

console.log(`✅ Version bumped: ${versionData.version} → ${newVersion}`);
