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
const CHAT_FILE    = path.join(ROOT, '_partials', 'chat.html');
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
const hasChat   = fs.existsSync(CHAT_FILE);

if (!hasHeader && !hasFooter && !hasChat) {
  console.error('Error: No partials found in _partials.');
  process.exit(1);
}

const rawHeaderHtml = hasHeader ? fs.readFileSync(HEADER_FILE, 'utf8').trimEnd() : null;
const footerHtml    = hasFooter ? fs.readFileSync(FOOTER_FILE, 'utf8').trimEnd() : null;
const chatHtml      = hasChat   ? fs.readFileSync(CHAT_FILE, 'utf8').trim() : null;

const files = findHtmlFiles(ROOT);
let updated = 0;
let unchanged = 0;
let skipped = 0;

const headerRegex = /<header[\s\S]*?<\/header>/i;
const footerRegex = /<footer[\s\S]*?<\/footer>/i;
const chatRegex   = /<!-- chat:start -->[\s\S]*?<!-- chat:end -->/i;

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

  // Chat injection (skip redirects and 404/non-standard pages)
  const isRedirect = /http-equiv=["']refresh["']/i.test(content);
  if (isRedirect) {
    if (chatRegex.test(content)) {
      content = content.replace(chatRegex, '');
    }
  } else if (chatHtml) {
    if (chatRegex.test(content)) {
      content = content.replace(chatRegex, chatHtml);
    } else if (content.includes('</body>')) {
      content = content.replace('</body>', '  ' + chatHtml + '\n</body>');
    }
  }

  // Clean up any mascot-dialogues.js references (merged into single mascot.js)
  content = content.replace(/<script\s+src="\/assets\/js\/mascot-dialogues\.js[^>]*><\/script>\s*/g, '');

  // Mascot injection (skip redirects) — single clean mascot.js file
  if (!isRedirect && !content.includes('/assets/js/mascot.js')) {
    if (content.includes('src="/assets/js/main.js')) {
      content = content.replace(/(<script\s+src="\/assets\/js\/main\.js[^>]*><\/script>)/, '  <script src="/assets/js/mascot.js?v=2" defer></script>\n$1');
    } else if (content.includes('</body>')) {
      content = content.replace('</body>', '  <script src="/assets/js/mascot.js?v=2" defer></script>\n</body>');
    }
  }

  // Keep latest asset versions intact (main.css v=52, main.js v=39)
  content = content.replace(/href="\/assets\/css\/main\.css(?:\?v=\d+)?"/g, 'href="/assets/css/main.css?v=52"');
  content = content.replace(/src="\/assets\/js\/main\.js(?:\?v=\d+)?"/g, 'src="/assets/js/main.js?v=39"');

  // Inject mascot.css into <head> right after main.css (if not already present and not a redirect)
  if (!isRedirect && !content.includes('/assets/css/mascot.css')) {
    if (content.includes('href="/assets/css/main.css?v=52"')) {
      content = content.replace(
        '<link rel="stylesheet" href="/assets/css/main.css?v=52">',
        '<link rel="stylesheet" href="/assets/css/main.css?v=52">\n<link rel="stylesheet" href="/assets/css/mascot.css?v=5">'
      );
    }
  }

  // Update mascot.js & mascot.css version (cache buster)
  content = content.replace(/src="\/assets\/js\/mascot\.js(?:\?v=\d+)?"/g, 'src="/assets/js/mascot.js?v=16"');
  content = content.replace(/href="\/assets\/css\/mascot\.css(?:\?v=\d+)?"/g, 'href="/assets/css/mascot.css?v=5"');

  if (!headerRegex.test(original) && !footerRegex.test(original) && !content.includes('</body>')) {
    console.log(`  SKIP  (no target)         ${rel}`);
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
