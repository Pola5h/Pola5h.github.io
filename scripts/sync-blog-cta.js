#!/usr/bin/env node
/**
 * scripts/sync-blog-cta.js
 * Synchronizes CTA buttons and Schema.org jobTitle across all blog posts.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');

const OLD_CTA = '<div class="cta-band__actions"><a class="btn btn--solid" href="/services/">Engineering Services</a><a class="btn btn--line" href="/#contact">Get in Touch</a></div>';
const NEW_CTA = '<div class="cta-band__actions"><button type="button" class="btn btn--solid" data-open-chat>Chat now</button><a class="btn btn--line" href="/services/">Engineering Services</a><a class="btn btn--line" href="https://wa.me/8801791296967?text=Hi%20Polash%2C%20I%20found%20your%20blog%20and%20would%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer">WhatsApp</a></div>';

const OLD_JOB = '"jobTitle":"Backend Software Engineer & SaaS Architect"';
const NEW_JOB = '"jobTitle":"Custom Software Engineer & Backend Architect"';

const OLD_BYLINE = '<div class="byline__date">Backend engineer · Laravel, REST APIs, multi-tenant SaaS</div>';
const NEW_BYLINE = '<div class="byline__date">Custom software &amp; backend engineer · Laravel, SaaS, APIs</div>';

const OLD_KNOWS = '"knowsAbout":["Laravel","PHP","REST API design","MySQL","Docker","Kubernetes","Multi-tenancy","WooCommerce","Redis"]';
const NEW_KNOWS = '"knowsAbout":["Laravel","PHP","REST API design","MySQL","Docker","Kubernetes","Multi-tenancy","WooCommerce","Redis","POS Systems","E-commerce Automation","Courier API Integration","Payment Gateway Integration"]';

// Also upgrade older compact knowsAbout variants that may exist in pre-SEO blog posts
const OLD_KNOWS_V2 = '"knowsAbout":["Laravel","PHP","REST API design","MySQL","Docker","Kubernetes","Multi-tenancy","WooCommerce","Redis","POS Systems","E-commerce Automation","Courier API Integration","Payment Gateway Integration"]';
const NEW_KNOWS_V2 = OLD_KNOWS_V2; // already up to date — no-op, kept for future upgrades

function findHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = findHtmlFiles(BLOG_DIR);
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (content.includes(OLD_CTA)) {
    content = content.replace(OLD_CTA, NEW_CTA);
  }

  if (content.includes(OLD_JOB)) {
    content = content.replaceAll(OLD_JOB, NEW_JOB);
  }

  if (content.includes(OLD_BYLINE)) {
    content = content.replaceAll(OLD_BYLINE, NEW_BYLINE);
  }

  if (content.includes(OLD_KNOWS)) {
    content = content.replaceAll(OLD_KNOWS, NEW_KNOWS);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const rel = path.relative(ROOT, file);
    console.log(`✓ Updated: ${rel}`);
    updatedCount++;
  }
}

console.log(`\nDone: ${updatedCount} blog file(s) updated.`);
