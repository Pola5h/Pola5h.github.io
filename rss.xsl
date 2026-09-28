<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> (RSS Feed)</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
        <style><![CDATA[
          :root {
            --paper: #09090b;
            --paper-2: #121215;
            --paper-3: #18181b;
            --ink: #fafafa;
            --muted: #a1a1aa;
            --line: rgba(255, 255, 255, 0.09);
            --line-2: rgba(255, 255, 255, 0.16);
            --accent: #6366f1;
            --accent-soft: rgba(99, 102, 241, 0.15);
            --radius: 12px;
            --radius-sm: 6px;
            --sans: 'Inter', system-ui, -apple-system, sans-serif;
            --mono: 'JetBrains Mono', monospace;
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: var(--paper);
            color: var(--ink);
            font-family: var(--sans);
            line-height: 1.6;
            padding: 2rem 1.25rem 5rem;
            min-height: 100vh;
          }
          .container {
            max-width: 48rem;
            margin-inline: auto;
          }
          .nav-back {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            font-family: var(--mono);
            font-size: .8rem;
            color: var(--muted);
            text-decoration: none;
            margin-bottom: 2rem;
            padding: .4rem .8rem;
            border-radius: var(--radius-sm);
            background: var(--paper-2);
            border: 1px solid var(--line);
            transition: color .2s, border-color .2s;
          }
          .nav-back:hover {
            color: var(--ink);
            border-color: var(--line-2);
          }
          .callout {
            background: linear-gradient(180deg, var(--paper-2), var(--paper-3));
            border: 1px solid var(--line-2);
            border-radius: var(--radius);
            padding: 1.75rem;
            margin-bottom: 3rem;
            box-shadow: 0 16px 36px -12px rgba(0,0,0,0.5);
          }
          .callout__header {
            display: flex;
            align-items: center;
            gap: .85rem;
            margin-bottom: .75rem;
          }
          .callout__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: var(--radius-sm);
            background: var(--accent-soft);
            color: var(--accent);
            border: 1px solid rgba(99, 102, 241, 0.3);
          }
          .callout__icon svg {
            display: block;
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }
          .callout__title {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--ink);
            letter-spacing: -0.02em;
          }
          .callout__text {
            color: var(--muted);
            font-size: .92rem;
            margin-bottom: 1.25rem;
            max-width: 60ch;
          }
          .feed-box {
            display: flex;
            gap: .6rem;
            align-items: center;
          }
          .feed-input {
            flex: 1 1 auto;
            min-width: 0;
            height: 2.6rem;
            background: var(--paper);
            border: 1px solid var(--line-2);
            color: var(--ink);
            font-family: var(--mono);
            font-size: .82rem;
            padding: 0 .85rem;
            border-radius: var(--radius-sm);
          }
          .copy-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: .4rem;
            height: 2.6rem;
            white-space: nowrap;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: var(--radius-sm);
            font-family: var(--mono);
            font-size: .82rem;
            font-weight: 600;
            padding: 0 1.25rem;
            cursor: pointer;
            transition: opacity .2s, transform .1s;
          }
          .copy-btn:hover {
            opacity: .92;
          }
          .copy-btn:active {
            transform: scale(0.98);
          }
          .section-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            margin-bottom: 1.25rem;
            border-bottom: 1px solid var(--line);
            padding-bottom: .6rem;
          }
          .section-title {
            font-family: var(--mono);
            font-size: .82rem;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--muted);
          }
          .articles {
            display: grid;
            gap: 1.25rem;
          }
          .item-card {
            display: block;
            text-decoration: none;
            background: var(--paper-2);
            border: 1px solid var(--line);
            border-radius: var(--radius);
            padding: 1.4rem;
            transition: border-color .2s, transform .2s;
          }
          .item-card:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
          }
          .item-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: .75rem;
            margin-bottom: .5rem;
          }
          .badge {
            display: inline-block;
            font-family: var(--mono);
            font-size: .7rem;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--accent);
            background: var(--accent-soft);
            padding: .2rem .5rem;
            border-radius: 999px;
            border: 1px solid rgba(99, 102, 241, 0.25);
          }
          .item-date {
            font-family: var(--mono);
            font-size: .75rem;
            color: var(--muted);
          }
          .item-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--ink);
            margin-bottom: .45rem;
            line-height: 1.35;
          }
          .item-card:hover .item-title {
            color: var(--accent);
          }
          .item-desc {
            color: var(--muted);
            font-size: .88rem;
            line-height: 1.55;
          }
          @media (max-width: 580px) {
            body { padding: 1.25rem 1rem 3rem; }
            .callout { padding: 1.25rem; margin-bottom: 2rem; }
            .feed-box { flex-direction: column; align-items: stretch; }
            .feed-input { flex: none; width: 100%; }
            .copy-btn { width: 100%; }
            .item-card { padding: 1.15rem; }
          }
        ]]></style>
      </head>
      <body>
        <div class="container">
          <a href="/blog/" class="nav-back">
            <span>&#8592;</span> Back to Engineering Blog
          </a>

          <div class="callout">
            <div class="callout__header">
              <div class="callout__icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 11a9 9 0 0 1 9 9"/>
                  <path d="M4 4a16 16 0 0 1 16 16"/>
                  <circle cx="5" cy="19" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <h1 class="callout__title">RSS Feed</h1>
            </div>
            <p class="callout__text">
              This is the web feed for <strong><xsl:value-of select="/rss/channel/title"/></strong>. Paste this feed URL into your RSS reader (such as Feedly, Inoreader, or NetNewsWire) to get automatic updates whenever a new article is published.
            </p>
            <div class="feed-box">
              <input type="text" class="feed-input" id="feed-url" readonly="readonly" value="https://pola5h.github.io/rss.xml"/>
              <button type="button" class="copy-btn" id="copy-btn">Copy Feed URL</button>
            </div>
          </div>

          <div class="section-head">
            <h2 class="section-title">Latest Published Articles</h2>
            <span class="item-date"><xsl:value-of select="count(/rss/channel/item)"/> posts</span>
          </div>

          <div class="articles">
            <xsl:for-each select="/rss/channel/item">
              <a class="item-card" href="{link}">
                <div class="item-meta">
                  <xsl:if test="category">
                    <span class="badge"><xsl:value-of select="category"/></span>
                  </xsl:if>
                  <span class="item-date"><xsl:value-of select="pubDate"/></span>
                </div>
                <h3 class="item-title"><xsl:value-of select="title"/></h3>
                <p class="item-desc"><xsl:value-of select="description"/></p>
              </a>
            </xsl:for-each>
          </div>
        </div>

        <script><![CDATA[
          var input = document.getElementById('feed-url');
          if (input && window.location.origin) {
            input.value = window.location.origin + '/rss.xml';
          }

          // Normalize article links to stay on current host (e.g. localhost or custom domain)
          var cards = document.querySelectorAll('.item-card');
          for (var i = 0; i < cards.length; i++) {
            var href = cards[i].getAttribute('href');
            if (href) {
              cards[i].setAttribute('href', href.replace(/^https?:\/\/[^\/]+/, ''));
            }
          }

          document.getElementById('copy-btn').addEventListener('click', function() {
            var btn = this;
            if (!input) return;
            input.select();
            navigator.clipboard.writeText(input.value).then(function() {
              btn.textContent = 'Copied!';
              setTimeout(function() {
                btn.textContent = 'Copy Feed URL';
              }, 2000);
            }).catch(function() {
              btn.textContent = 'Selected!';
            });
          });
        ]]></script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
