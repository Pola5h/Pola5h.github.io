#!/usr/bin/env node
/**
 * inject-partials.js
 * ------------------
 * Replaces <header>...</header> and <footer>...</footer> in every HTML file
 * with _partials/header.html and _partials/footer.html.
 *
 * Automatically preserves active page navigation (aria-current="page") on
 * blog and services pages.
 *
 * Usage:
 *   node scripts/inject-partials.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT         = path.resolve(__dirname, '..');
const HEADER_FILE  = path.join(ROOT, '_partials', 'header.html');
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

function getHeaderForFile(headerTemplate, relPath) {
  let h = headerTemplate;
  // Normalize path separators
  const norm = relPath.replace(/\\/g, '/');

  if (norm.startsWith('blog/')) {
    h = h.replace('href="/blog/" class="nav__link"', 'href="/blog/" class="nav__link" aria-current="page"');
  } else if (norm.startsWith('services/')) {
    h = h.replace('href="/services/" class="nav__link"', 'href="/services/" class="nav__link" aria-current="page"');
  }
  return h;
}

// ── main ─────────────────────────────────────────────────────────────────────

const hasHeader = fs.existsSync(HEADER_FILE);
const hasFooter = fs.existsSync(FOOTER_FILE);

if (!hasHeader && !hasFooter) {
  console.error('Error: Neither _partials/header.html nor _partials/footer.html found.');
  process.exit(1);
}

const rawHeaderHtml = hasHeader ? fs.readFileSync(HEADER_FILE, 'utf8').trimEnd() : null;
const footerHtml    = hasFooter ? fs.readFileSync(FOOTER_FILE, 'utf8').trimEnd() : null;

const files = findHtmlFiles(ROOT);
let updated = 0;
let unchanged = 0;
let skipped = 0;

const headerRegex = /<header[\s\S]*?<\/header>/i;
const footerRegex = /<footer[\s\S]*?<\/footer>/i;

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const original = fs.readFileSync(file, 'utf8');
  let content = original;

  // Header injection
  if (rawHeaderHtml && headerRegex.test(content)) {
    const fileHeader = getHeaderForFile(rawHeaderHtml, rel);
    content = content.replace(headerRegex, fileHeader);
  }

  // Footer injection
  if (footerHtml && footerRegex.test(content)) {
    content = content.replace(footerRegex, footerHtml);
  }

  if (!headerRegex.test(original) && !footerRegex.test(original)) {
    console.log(`  SKIP  (no header/footer)  ${rel}`);
    skipped++;
    continue;
  }

  if (content === original) {
    console.log(`  SAME  (unchanged)         ${rel}`);
    unchanged++;
    continue;
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`  ✓     (updated)           ${rel}`);
  updated++;
}

console.log(`\nDone — ${updated} file(s) updated, ${unchanged} unchanged, ${skipped} skipped.`);
