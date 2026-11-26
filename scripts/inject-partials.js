#!/usr/bin/env node
/**
 * inject-partials.js
 * ------------------
 * Replaces <header>...</header>, #mobile-menu, <footer>...</footer>, and
 * <!-- chat:start -->...<!-- chat:end --> in every standard HTML file with
 * _partials/header.html, _partials/mobile-menu.html, _partials/footer.html,
 * and _partials/chat.html.
 *
 * Also normalizes SEO & Google Search Central requirements across all pages:
 * - Active page navigation (aria-current="page") in desktop & mobile menus
 * - 192x192 PNG favicon link (>48px Google Search requirement)
 * - max-image-preview:large on indexable pages (Google Discover)
 * - Valid name="twitter:image" meta attribute
 * - Specific og:image:alt on article pages
 * - Linked author bylines (/blog/* -> /#about)
 * - JSON-LD normalization: Organization.logo (192x192), Person.image
 *   (polash-profile.jpg), TechArticle.image synced with og:image, WebSite
 *   restricted to root / with clean site name, ProfilePage on root /, and
 *   decoded HTML entities inside JSON strings.
 *
 * Usage:
 *   node scripts/inject-partials.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT             = path.resolve(__dirname, '..');
const HEADER_FILE      = path.join(ROOT, '_partials', 'header.html');
const MOBILE_MENU_FILE = path.join(ROOT, '_partials', 'mobile-menu.html');
const FOOTER_FILE      = path.join(ROOT, '_partials', 'footer.html');
const CHAT_FILE        = path.join(ROOT, '_partials', 'chat.html');
const IGNORE_DIRS      = new Set([
  'node_modules',
  '.git',
  '_partials',
  '_site',
  'rss'
]);

function findHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name) && !entry.name.startsWith('polash.link-Performance-on-Search-')) {
        findHtmlFiles(path.join(dir, entry.name), results);
      }
    } else if (entry.name.endsWith('.html')) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/-&gt;/g, '->')
    .replace(/=&gt;/g, '=>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanJsonStrings(val) {
  if (typeof val === 'string') {
    return decodeHtmlEntities(val);
  }
  if (Array.isArray(val)) {
    return val.map(cleanJsonStrings);
  }
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = cleanJsonStrings(v);
    }
    return out;
  }
  return val;
}

function normalizeJsonLd(content, norm) {
  const ogImgMatch = content.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const ogImgUrl = ogImgMatch ? ogImgMatch[1] : null;

  return content.replace(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (full, rawJson) => {
    const isMultiline = rawJson.trimStart().startsWith('{\n');
    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (err) {
      console.error(`Warning: Invalid JSON-LD in ${norm}: ${err.message}`);
      return full;
    }

    parsed = cleanJsonStrings(parsed);

    if (Array.isArray(parsed['@graph'])) {
      // Remove duplicate WebSite schema on non-root pages (Google site-names policy)
      if (norm !== 'index.html') {
        parsed['@graph'] = parsed['@graph'].filter((node) => node['@type'] !== 'WebSite');
      }

      for (const node of parsed['@graph']) {
        const type = node['@type'];
        const types = Array.isArray(type) ? type : [type];

        // 1. Person.image -> actual profile photo
        if (types.includes('Person') && node['@id'] === 'https://polash.link/#person') {
          node.image = 'https://polash.link/assets/images/polash-profile.jpg';
        }

        // 2. Organization.logo -> 192x192 PNG (>= 112x112 Google requirement)
        if (types.includes('Organization') && node.logo) {
          node.logo = {
            '@type': 'ImageObject',
            url: 'https://polash.link/assets/images/favicon-192x192.png',
            width: 192,
            height: 192
          };
        }

        // 3. Root WebSite name + alternateName
        if (norm === 'index.html' && types.includes('WebSite')) {
          node.name = 'Kamruzzaman Polash';
          node.alternateName = ['K. Polash', 'polash.link'];
        }

        // 4. TechArticle.image synced with page's custom og:image
        if (types.includes('TechArticle') && ogImgUrl) {
          if (typeof node.image === 'string') {
            node.image = {
              '@type': 'ImageObject',
              url: ogImgUrl,
              width: 1200,
              height: 630
            };
          } else if (node.image && typeof node.image === 'object') {
            node.image.url = ogImgUrl;
            node.image.width = node.image.width || 1200;
            node.image.height = node.image.height || 630;
          }
        }
      }

      // 5. Ensure ProfilePage exists on root index.html
      if (norm === 'index.html' && !parsed['@graph'].some((n) => n['@type'] === 'ProfilePage')) {
        const websiteIdx = parsed['@graph'].findIndex((n) => n['@type'] === 'WebSite');
        const profileNode = {
          '@type': 'ProfilePage',
          '@id': 'https://polash.link/#profilepage',
          url: 'https://polash.link/',
          name: 'Kamruzzaman Polash — Custom Software Engineer & Backend Architect',
          mainEntity: { '@id': 'https://polash.link/#person' }
        };
        if (websiteIdx !== -1) {
          parsed['@graph'].splice(websiteIdx + 1, 0, profileNode);
        } else {
          parsed['@graph'].push(profileNode);
        }
      }
    }

    const serialized = isMultiline
      ? '\n' + JSON.stringify(parsed, null, 2) + '\n'
      : JSON.stringify(parsed);
    return `<script type="application/ld+json">${serialized}</script>`;
  });
}

function getHeaderForFile(headerTemplate, relPath) {
  let h = headerTemplate;
  const norm = relPath.replace(/\\/g, '/');

  if (norm.startsWith('blog/')) {
    h = h.replace('href="/blog/" class="nav__link"', 'href="/blog/" class="nav__link" aria-current="page"');
  } else if (norm.startsWith('services/')) {
    h = h.replace('href="/services/" class="nav__link"', 'href="/services/" class="nav__link" aria-current="page"');
    if (norm === 'services/index.html') {
      h = h.replace('href="/#contact" class="nav__link"', 'href="#contact" class="nav__link"');
    }
  }
  return h;
}

function getMobileMenuForFile(mobileTemplate, relPath) {
  let m = mobileTemplate;
  const norm = relPath.replace(/\\/g, '/');

  if (norm.startsWith('blog/')) {
    m = m.replace('class="mobile-menu__link" href="/blog/"', 'class="mobile-menu__link" href="/blog/" aria-current="page"');
  } else if (norm.startsWith('services/')) {
    m = m.replace('class="mobile-menu__link" href="/services/"', 'class="mobile-menu__link" href="/services/" aria-current="page"');
    if (norm === 'services/index.html') {
      m = m.replace(/href="\/#contact"/g, 'href="#contact"');
    }
  }
  return m;
}

const hasHeader     = fs.existsSync(HEADER_FILE);
const hasMobileMenu = fs.existsSync(MOBILE_MENU_FILE);
const hasFooter     = fs.existsSync(FOOTER_FILE);
const hasChat       = fs.existsSync(CHAT_FILE);

if (!hasHeader && !hasFooter && !hasChat) {
  console.error('Error: No partials found in _partials.');
  process.exit(1);
}

const rawHeaderHtml     = hasHeader ? fs.readFileSync(HEADER_FILE, 'utf8').trimEnd() : null;
const rawMobileMenuHtml = hasMobileMenu ? fs.readFileSync(MOBILE_MENU_FILE, 'utf8').trimEnd() : null;
const footerHtml        = hasFooter ? fs.readFileSync(FOOTER_FILE, 'utf8').trimEnd() : null;
const chatHtml          = hasChat   ? fs.readFileSync(CHAT_FILE, 'utf8').trim() : null;

const files = findHtmlFiles(ROOT);
let updated = 0;
let unchanged = 0;
let skipped = 0;

const headerAndMenuRegex = /<header\s+class="site-header"[\s\S]*?<\/header>(?:\s*<div\s+class="mobile-menu"\s+id="mobile-menu"[\s\S]*?<\/nav>\s*<\/div>)?/i;
const footerRegex        = /<footer[\s\S]*?<\/footer>/i;
const chatRegex          = /<!-- chat:start -->[\s\S]*?<!-- chat:end -->/i;

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const norm = rel.replace(/\\/g, '/');
  const original = fs.readFileSync(file, 'utf8');
  let content = original;

  const isRedirect = /http-equiv=["']refresh["']/i.test(content);

  // Header + Mobile Menu injection
  if (rawHeaderHtml && headerAndMenuRegex.test(content)) {
    const fileHeader = getHeaderForFile(rawHeaderHtml, rel);
    const fileMenu   = rawMobileMenuHtml ? '\n\n' + getMobileMenuForFile(rawMobileMenuHtml, rel) : '';
    content = content.replace(headerAndMenuRegex, fileHeader + fileMenu);
  }

  // Footer injection
  if (footerHtml && footerRegex.test(content)) {
    content = content.replace(footerRegex, footerHtml);
  }

  // Chat injection (skip redirects)
  if (isRedirect) {
    if (chatRegex.test(content)) {
      content = content.replace(chatRegex, '');
    }
  } else if (chatHtml) {
    if (chatRegex.test(content)) {
      content = content.replace(chatRegex, chatHtml);
    } else if (content.includes('</body>') && footerRegex.test(content)) {
      content = content.replace('</body>', '  ' + chatHtml + '\n</body>');
    }
  }

  // Clean up any mascot-dialogues.js references
  content = content.replace(/<script\s+src="\/assets\/js\/mascot-dialogues\.js[^>]*><\/script>\s*/g, '');

  // Mascot injection (skip redirects and verification stubs)
  if (!isRedirect && footerRegex.test(content) && !content.includes('/assets/js/mascot.js')) {
    if (content.includes('src="/assets/js/main.js')) {
      content = content.replace(/(<script\s+src="\/assets\/js\/main\.js[^>]*><\/script>)/, '  <script src="/assets/js/mascot.js?v=18" defer></script>\n$1');
    } else if (content.includes('</body>')) {
      content = content.replace('</body>', '  <script src="/assets/js/mascot.js?v=18" defer></script>\n</body>');
    }
  }

  // Remove below-the-fold footer font preload (keep top-of-page Inter, JetBrains Mono & Modelista Signature)
  content = content.replace(/<link\s+rel="preload"\s+href="\/assets\/fonts\/maqin-larisa\.woff2"[^>]*>\r?\n?/gi, '');

  // Remove render-blocking fonts-loading CSS rule and JS gate that hid <body> from Googlebot
  content = content.replace(/\r?\n?html\.fonts-loading\s+body\s*\{\s*opacity:\s*0;\s*pointer-events:\s*none;?\s*\}/gi, '');
  content = content.replace(/<script>\s*\(function\(\)\{\s*var\s+d=document\.documentElement;[\s\S]*?fonts-loading[\s\S]*?\}\)\(\);\s*<\/script>\r?\n?/gi, '');

  // Keep latest asset versions intact (main.css v=54, main.js v=39)
  content = content.replace(/href="\/assets\/css\/main\.css(?:\?v=\d+)?"/g, 'href="/assets/css/main.css?v=54"');
  content = content.replace(/src="\/assets\/js\/main\.js(?:\?v=\d+)?"/g, 'src="/assets/js/main.js?v=39"');

  // Inject mascot.css into <head> right after main.css (if not already present and not a redirect)
  if (!isRedirect && footerRegex.test(content) && !content.includes('/assets/css/mascot.css')) {
    if (content.includes('href="/assets/css/main.css?v=54"')) {
      content = content.replace(
        '<link rel="stylesheet" href="/assets/css/main.css?v=54">',
        '<link rel="stylesheet" href="/assets/css/main.css?v=54">\n<link rel="stylesheet" href="/assets/css/mascot.css?v=5">'
      );
    }
  }

  // Update mascot.js & mascot.css version
  content = content.replace(/src="\/assets\/js\/mascot\.js(?:\?v=\d+)?"/g, 'src="/assets/js/mascot.js?v=18"');
  content = content.replace(/href="\/assets\/css\/mascot\.css(?:\?v=\d+)?"/g, 'href="/assets/css/mascot.css?v=5"');

  // Ensure 192x192 PNG favicon link (>48px Google Search favicon requirement)
  if (!isRedirect && content.includes('href="/assets/images/favicon-32x32.png"') && !content.includes('href="/assets/images/favicon-192x192.png"')) {
    content = content.replace(
      '<link rel="icon" href="/assets/images/favicon-32x32.png" sizes="32x32" type="image/png">',
      '<link rel="icon" href="/assets/images/favicon-192x192.png" sizes="192x192" type="image/png">\n<link rel="icon" href="/assets/images/favicon-32x32.png" sizes="32x32" type="image/png">'
    );
  }

  // Fix invalid <meta property="twitter:image"> -> <meta name="twitter:image">
  content = content.replace(/<meta\s+property="twitter:image"/g, '<meta name="twitter:image"');

  // Ensure max-image-preview:large on indexable pages (Google Discover & Images)
  if (!isRedirect) {
    content = content.replace(
      /<meta\s+name="robots"\s+content="index,\s*follow">/g,
      '<meta name="robots" content="index, follow, max-image-preview:large">'
    );
  }

  // Replace generic copy-pasted og:image:alt on blog/article pages with descriptive title
  if (norm === 'blog/index.html') {
    content = content.replace(
      /<meta\s+property="og:image:alt"\s+content="Kamruzzaman Polash — (?:Backend Software|Laravel &amp; PHP Backend) Engineer">/i,
      '<meta property="og:image:alt" content="Laravel &amp; PHP Engineering Blog — Software Architecture by Kamruzzaman Polash">'
    );
  } else if (norm.startsWith('blog/')) {
    const ogTitleMatch = content.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch) {
      const specificAlt = `${ogTitleMatch[1]} — Kamruzzaman Polash`;
      content = content.replace(
        /<meta\s+property="og:image:alt"\s+content="Kamruzzaman Polash — (?:Backend Software|Laravel &amp; PHP Backend) Engineer">/i,
        `<meta property="og:image:alt" content="${specificAlt}">`
      );
    }
  }

  // Link author name in blog post bylines to /#about
  if (norm.startsWith('blog/') && norm !== 'blog/index.html') {
    content = content.replace(
      /<div class="byline__name">Kamruzzaman Polash<\/div>/g,
      '<div class="byline__name"><a href="/#about" rel="author">Kamruzzaman Polash</a></div>'
    );
  }

  // Normalize JSON-LD schemas
  if (!isRedirect && content.includes('application/ld+json')) {
    content = normalizeJsonLd(content, norm);
  }

  if (!headerAndMenuRegex.test(original) && !footerRegex.test(original) && !content.includes('</body>')) {
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
