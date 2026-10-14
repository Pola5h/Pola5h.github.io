#!/usr/bin/env node
/**
 * scripts/generate-sitemap.js
 * Generates /sitemap.xml by scanning static HTML pages.
 * - Extracts canonical URL for <loc> (inherits current or custom domain automatically)
 * - Uses dateModified/datePublished from JSON-LD, or falls back to last git commit date
 * - Skips pages with robots="noindex", 404.html, and redirect stubs
 * - Emits valid XML with only <loc> and <lastmod>, sorted newest first
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');

function getCanonical(content) {
  const match = content.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                content.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return match ? match[1].trim() : null;
}

function isNoindex(content) {
  const match = content.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) ||
                content.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  if (!match) return false;
  return match[1].toLowerCase().includes('noindex');
}

function getLastmod(filePath, content) {
  // 1. Try JSON-LD dateModified / datePublished
  const jsonLdMatch = content.match(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];

      // Prioritize Article / TechArticle / BlogPosting / WebPage
      for (const item of graph) {
        if (['TechArticle', 'BlogPosting', 'Article', 'WebPage'].includes(item['@type'])) {
          if (item.dateModified) return item.dateModified.split('T')[0];
          if (item.datePublished) return item.datePublished.split('T')[0];
        }
      }

      // Check other items excluding the Blog container (which lists all nested posts)
      for (const item of graph) {
        if (item['@type'] !== 'Blog') {
          if (item.dateModified) return item.dateModified.split('T')[0];
          if (item.datePublished) return item.datePublished.split('T')[0];
        }
      }
    } catch (e) {
      // Regex fallback if JSON parsing fails
      const dmMatch = jsonLdMatch[1].match(/"dateModified"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      if (dmMatch) return dmMatch[1];
      const dpMatch = jsonLdMatch[1].match(/"datePublished"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      if (dpMatch) return dpMatch[1];
    }
  }

  // 2. Fall back to git last commit date
  try {
    const gitDate = execSync(`git log -1 --format=%cs -- "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      cwd: ROOT_DIR
    }).trim();
    if (gitDate && /^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
      return gitDate;
    }
  } catch (e) {
    // Git command not available or untracked file
  }

  // 3. Fall back to filesystem mtime
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function collectCandidateFiles(rootDir) {
  const files = [
    path.join(rootDir, 'index.html'),
    path.join(rootDir, 'blog', 'index.html'),
    path.join(rootDir, 'services', 'index.html')
  ];

  // Scan all blog posts: /blog/*/index.html
  const blogDir = path.join(rootDir, 'blog');
  if (fs.existsSync(blogDir)) {
    const entries = fs.readdirSync(blogDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const postIndex = path.join(blogDir, entry.name, 'index.html');
        if (fs.existsSync(postIndex)) {
          files.push(postIndex);
        }
      }
    }
  }

  // Scan services subpages if any exist
  const servicesDir = path.join(rootDir, 'services');
  if (fs.existsSync(servicesDir)) {
    const entries = fs.readdirSync(servicesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const svcIndex = path.join(servicesDir, entry.name, 'index.html');
        if (fs.existsSync(svcIndex)) {
          files.push(svcIndex);
        }
      }
    }
  }

  return files;
}

function generateSitemap() {
  const candidateFiles = collectCandidateFiles(ROOT_DIR);
  const entries = [];
  const seenUrls = new Set();

  for (const filePath of candidateFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath);

    // Skip 404
    if (path.basename(filePath) === '404.html') {
      continue;
    }

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Skip noindex
    if (isNoindex(content)) {
      continue;
    }

    // Skip redirect stubs (e.g. meta refresh or window.location)
    if (content.includes('http-equiv="refresh"') && content.includes('window.location')) {
      continue;
    }

    const loc = getCanonical(content);
    if (!loc) {
      console.warn(`  [Warning] No canonical URL found in: ${relativePath}`);
      continue;
    }

    if (seenUrls.has(loc)) {
      continue;
    }
    seenUrls.add(loc);

    const lastmod = getLastmod(filePath, content);
    entries.push({ loc, lastmod, file: relativePath });
  }

  // Sort newest first by lastmod descending
  entries.sort((a, b) => {
    if (b.lastmod !== a.lastmod) {
      return b.lastmod.localeCompare(a.lastmod);
    }
    // Tie-break: homepage first
    const aIsHome = a.loc.endsWith('.io/') || a.loc.endsWith('.com/') || a.loc.match(/^https?:\/\/[^\/]+\/?$/);
    const bIsHome = b.loc.endsWith('.io/') || b.loc.endsWith('.com/') || b.loc.match(/^https?:\/\/[^\/]+\/?$/);
    if (aIsHome && !bIsHome) return -1;
    if (!aIsHome && bIsHome) return 1;
    return a.loc.localeCompare(b.loc);
  });

  // Construct valid XML
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];

  for (const entry of entries) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${entry.loc}</loc>`);
    xmlLines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    xmlLines.push('  </url>');
  }

  xmlLines.push('</urlset>');
  xmlLines.push('');

  const xmlContent = xmlLines.join('\n');
  fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf8');

  console.log(`Generated /sitemap.xml with ${entries.length} URLs (sorted newest first).`);
  for (const entry of entries) {
    console.log(`  ${entry.lastmod}  ${entry.loc}`);
  }
}

generateSitemap();
