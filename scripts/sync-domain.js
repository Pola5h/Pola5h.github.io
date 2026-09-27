#!/usr/bin/env node
/**
 * scripts/sync-domain.js
 * Synchronizes SITE_URL from .env across all static assets:
 * - HTML canonical, og:url, og:image, twitter:url, twitter:image, ld+json Schema.org
 * - sitemap.xml (<loc> links)
 * - robots.txt (Sitemap directive)
 * - rss.xml (<link>, <guid>, <atom:link>)
 * - rss.xsl (fallback input value)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Read or parse .env
function getSiteUrl() {
  const cliArg = process.argv[2];
  if (cliArg && cliArg.startsWith('http')) {
    return cliArg.trim().replace(/\/+$/, '');
  }

  const envPath = path.join(ROOT_DIR, '.env');
  const examplePath = path.join(ROOT_DIR, '.env.example');

  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(examplePath)) {
    content = fs.readFileSync(examplePath, 'utf8');
  }

  const match = content.match(/^\s*SITE_URL\s*=\s*([^\s#]+)/m);
  if (match && match[1]) {
    return match[1].trim().replace(/\/+$/, '');
  }

  return 'https://pola5h.github.io';
}

// 2. Detect existing domain from sitemap.xml or robots.txt
function detectCurrentDomain() {
  const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const match = sitemapContent.match(/<loc>(https?:\/\/[^\/<\s]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  const robotsPath = path.join(ROOT_DIR, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    const match = robotsContent.match(/Sitemap:\s*(https?:\/\/[^\/<\s]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  return 'https://pola5h.github.io';
}

// 3. Find all target files
function getAllFiles(dir, exts, results = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.agents') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, exts, results);
    } else {
      if (exts.includes(path.extname(file)) || ['robots.txt'].includes(file)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function run() {
  const targetUrl = getSiteUrl();
  const currentUrl = detectCurrentDomain();

  console.log(`\n========================================`);
  console.log(`Domain Synchronizer`);
  console.log(`Current Domain : ${currentUrl}`);
  console.log(`Target Domain  : ${targetUrl}`);
  console.log(`========================================\n`);

  if (targetUrl === currentUrl) {
    console.log(`Target URL matches current domain (${currentUrl}). Everything is in sync.`);
    return;
  }

  const files = getAllFiles(ROOT_DIR, ['.html', '.xml', '.xsl', '.txt']);
  let updatedCount = 0;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(currentUrl)) {
      const updated = content.split(currentUrl).join(targetUrl);
      fs.writeFileSync(filePath, updated, 'utf8');
      const relPath = path.relative(ROOT_DIR, filePath);
      console.log(`  ✓ Updated: ${relPath}`);
      updatedCount++;
    }
  }

  // Also update .env file if CLI argument was provided
  const envPath = path.join(ROOT_DIR, '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('SITE_URL=')) {
      envContent = envContent.replace(/^\s*SITE_URL\s*=.*$/m, `SITE_URL=${targetUrl}`);
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
  }

  console.log(`\n🎉 Done! Synchronized ${updatedCount} files to: ${targetUrl}\n`);
}

run();
