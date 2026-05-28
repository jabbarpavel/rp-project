/**
 * Dieses Script wird vor jedem Build ausgeführt und generiert
 * src/app/core/build-info.ts mit aktuellem Timestamp + Git-Hash.
 * Wird automatisch von npm run build aufgerufen.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let gitHash = process.env.GIT_HASH || 'local';
let gitBranch = process.env.GIT_BRANCH || 'local';

try {
  if (gitHash === 'local') gitHash = execSync('git rev-parse --short HEAD').toString().trim();
  if (gitBranch === 'local') gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch {
  // Kein Git vorhanden (z.B. Docker Build)
}

const now = new Date();
const buildTime = now.toISOString();

const content = `// AUTO-GENERIERT – Nicht manuell bearbeiten!
// Wird durch generate-build-info.js erstellt.
export const BUILD_INFO = {
  timestamp: '${buildTime}',
  gitHash: '${gitHash}',
  branch: '${gitBranch}',
};
`;

const outPath = path.join(__dirname, 'src', 'app', 'core', 'build-info.ts');
fs.writeFileSync(outPath, content, 'utf8');
console.log(`✅ Build-Info generiert: ${gitBranch}@${gitHash} (${buildTime})`);
