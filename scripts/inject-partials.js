#!/usr/bin/env node
/**
 * inject-partials.js
 * ------------------
 * Replaces <footer>...</footer> in every HTML file with _partials/footer.html
 *
 * Usage:
 *   node scripts/inject-partials.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT         = path.resolve(__dirname, '..');
const FOOTER_FILE  = path.join(ROOT, '_partials', 'footer.html');
const IGNORE_DIRS  = new Set(['node_modules', '.git', '_partials', '_site']);

// ── helpers ──────────────────────────────────────────────────────────────────

function findHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        findHtmlFiles(path.join(dir, entry.name), results);
      }
    } else if (entry.name.endsWith('.html')) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

// ── main ─────────────────────────────────────────────────────────────────────

const footerHtml = fs.readFileSync(FOOTER_FILE, 'utf8').trimEnd();

const files = findHtmlFiles(ROOT);
let updated = 0;
let skipped = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');

  // Match <footer ...> ... </footer> (including multiline)
  const footerRegex = /<footer[\s\S]*?<\/footer>/i;

  if (!footerRegex.test(original)) {
    console.log(`  SKIP  (no <footer>)  ${path.relative(ROOT, file)}`);
    skipped++;
    continue;
  }

  const updated_content = original.replace(footerRegex, footerHtml);

  if (updated_content === original) {
    console.log(`  SAME  (unchanged)    ${path.relative(ROOT, file)}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(file, updated_content, 'utf8');
  console.log(`  ✓     (updated)      ${path.relative(ROOT, file)}`);
  updated++;
}

console.log(`\nDone — ${updated} file(s) updated, ${skipped} skipped.`);
