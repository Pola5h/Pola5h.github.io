/**
 * Kamruzzaman Polash — Page Mascot Controller (Context-Aware Game Companion)
 * Dynamic page intelligence across Homepage, Services, 404 & all 25 Blog Articles!
 * Self-mounting, accessible, zero-dependency vanilla JS widget.
 */
(() => {
  'use strict';

  const DIRECTIONS = [
    'up-left',
    'up',
    'up-right',
    'left',
    'center',
    'right',
    'down-left',
    'down',
    'down-right',
  ];

  const REACTIONS = [
    'blink',
    'heart',
    'sparkle',
    'surprised',
    'wink',
    'bashful',
    'sleepy',
    'dizzy',
    'delighted',
  ];

  const ACTIONS_1 = [
    'coffee',     // 0: Coffee Break (steaming mug)
    'thinking',   // 1: Thinking / Head scratch
    'waving',     // 2: Waving Hello
    'thumbs_up',  // 3: Thumbs Up
    'coding',     // 4: Coding on Laptop
    'cool',       // 5: Cool Sunglasses
    'builder',    // 6: System Builder (wrench)
    'shield',     // 7: Security Shield
    'reading',    // 8: Reading Docs
  ];

  const ACTIONS_2 = [
    'celebrate',  // 0: Party Celebration 🎉
    'debug',      // 1: Code Debugger (magnifying glass) 🔍
    'idea',       // 2: Idea Lightbulb 💡
    'rocket',     // 3: Rocket Launch 🚀
    'peace',      // 4: Peace Sign ✌️
    'rock',       // 5: Rock On 🤘
    'flex',       // 6: Engineering Strength / Flex 💪
    'salam',      // 7: Respectful Islamic Salam / Hand on Heart 🤝
    'yawn',       // 8: Sleepy Yawn 🥱
  ];

  const CLOCKWISE = [
    'right',
    'down-right',
    'down',
    'down-left',
    'left',
    'up-left',
    'up',
    'up-right',
  ];

  const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
  const HYSTERESIS = 0.12;
  const DEAD_ZONE = 50;
  const BOOP_PAYOFF = 120;
  const BOOP_END = 560;
  const SQUASH_MS = 400;
  const DIZZY_AFTER = 4;
  const DIZZY_WINDOW = 1600;
  const DIZZY_END = 1100;

  const SQUASH = [
    { transform: 'scale(1, 1)', easing: 'ease-in' },
    { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
    { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
    { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
    { transform: 'scale(1, 1)' },
  ];

  // --------------------------------------------------------------------------
  // Central Dialogues & Scenarios (All 25 Blogs, Services, 404 & Homepage)
  // Easy to edit: modify any 'text' or 'reaction' below!
  // --------------------------------------------------------------------------
  const SCENARIOS = [
    // ------------------------------------------------------------------------
    // 404 Error Page
    // ------------------------------------------------------------------------
    {
      name: "404 Error Page",
      match: path => path.includes('404'),
      welcome: { reaction: 'surprised', text: "Lost in the cluster? Route not found! 🧭" },
      variants: [
        { reaction: 'thinking', text: "Did an upstream microservice change the route schema? 🤔" },
        { reaction: 'debug',    text: "Even resilient distributed systems hit missing endpoints! 🔍" },
        { reaction: 'waving',   text: "Let's teleport back to the home page! 🚀" }
      ]
    },

    // ------------------------------------------------------------------------
    // Services Page
    // ------------------------------------------------------------------------
    {
      name: "Services & Capabilities",
      match: path => path.startsWith('/services'),
      welcome: { reaction: 'builder', text: "Need an engineer who builds scalable systems without drama? 🛠️" },
      variants: [
        { reaction: 'flex',      text: "Multi-branch retail POS with offline sync & zero recurring fees! 💪" },
        { reaction: 'rocket',    text: "Automated logistics pipelines handling thousands of parcels daily 🚚" },
        { reaction: 'cool',      text: "APIs architected to handle 10,000+ requests per minute effortlessly 😎" },
        { reaction: 'thumbs_up', text: "Available for fixed-scope milestone projects or dedicated roles 💼" },
        { reaction: 'celebrate', text: "Ready to scale? Click 'Book a discovery call' below! 📅" }
      ]
    },

    // ------------------------------------------------------------------------
    // Blog Archive (Overview page)
    // ------------------------------------------------------------------------
    {
      name: "Blog Archive",
      match: path => path === '/blog/' || path === '/blog' || path.startsWith('/blog/index'),
      welcome: { reaction: 'coffee', text: "Grab your coffee! 25+ battle-tested backend deep-dives below ☕" },
      variants: [
        { reaction: 'thinking',  text: "Ever wondered why simple queries freeze under 100 concurrent users? 🤔" },
        { reaction: 'shield',    text: "Real production architectures only—zero fluffy beginner theory! 🛡️" },
        { reaction: 'reading',   text: "Pick a topic: Laravel internals, Docker workers, or database indexing 💡" },
        { reaction: 'rock',      text: "Level up your systems engineering game today! 🤘" }
      ]
    },

    // ------------------------------------------------------------------------
    // 25 Specific Blog Articles (Smartly Mapped with Actions & Intriguing Trivia)
    // ------------------------------------------------------------------------

    // Blog 1: PHP RCE Vulnerability Patch
    {
      name: "PHP RCE (CVE-2026-109618)",
      match: path => path.includes('php-rce-cve-2026-109618-fix'),
      welcome: { reaction: 'surprised', text: "Wait, did you patch CVE-2026-109618 yet? Unauthenticated RCE is in the wild! 🚨" },
      variants: [
        { reaction: 'debug',   text: "Why can't Laravel or Symfony middleware stop multipart boundary overflow bugs? 🔍" },
        { reaction: 'shield',  text: "Emergency mitigation: disable_functions or WAF rule? What's your 5-min defense? 🛡️" },
        { reaction: 'cool',    text: "Upgraded your PHP runtime packages? Now you can sleep in peace! 😎" }
      ]
    },

    // Blog 2: Doppar Framework Review
    {
      name: "Doppar Framework Review",
      match: path => path.includes('doppar-php-framework-review'),
      welcome: { reaction: 'thinking', text: "Can an ultra-light PHP micro-framework really outperform Laravel at 10k RPM? 🔬" },
      variants: [
        { reaction: 'reading', text: "Doppar's DI container vs Laravel Service Container: where does memory go? ⏱️" },
        { reaction: 'coffee',  text: "Micro-framework raw speed vs Laravel's rich ecosystem—which fits your startup? ☕" },
        { reaction: 'rock',    text: "Benchmarked with wrk and zero CPU throttling! Check out the p99 latency! 🤘" }
      ]
    },

    // Blog 3: White-Label Live Chat with Ably & Telegram
    {
      name: "White-Label Live Chat (Ably & Telegram)",
      match: path => path.includes('white-label-live-chat-ably-telegram'),
      welcome: { reaction: 'celebrate', text: "Why pay $50/mo for Intercom when you can route live chat straight to Telegram? 💬" },
      variants: [
        { reaction: 'coding',    text: "How do Telegram Forum Topics map 1:1 to unique visitor sessions via Ably? 📱" },
        { reaction: 'cool',      text: "Zero third-party analytics trackers, zero bloated widgets, and pure WebSockets! ⚡" },
        { reaction: 'thumbs_up', text: "Reply from your phone on the road while visitor sees instant typing status on site! 🤝" }
      ]
    },

    // Blog 4: WooCommerce Overselling Fix
    {
      name: "WooCommerce Overselling Fix",
      match: path => path.includes('woocommerce-overselling-inventory-sync'),
      welcome: { reaction: 'shield', text: "Ever had 2 customers purchase the exact same last inventory item at once? 😱" },
      variants: [
        { reaction: 'debug',   text: "Why do default WooCommerce transactions fail during concurrent flash sales? 🔍" },
        { reaction: 'builder', text: "How database row locks (SELECT FOR UPDATE) stop inventory drift permanently 🔒" },
        { reaction: 'flex',    text: "A central ledger handles physical outlet POS and online store simultaneously! 💪" }
      ]
    },

    // Blog 5: Automate Pathao & Steadfast Courier
    {
      name: "Automate Pathao & Steadfast Courier",
      match: path => path.includes('automate-pathao-steadfast-courier'),
      welcome: { reaction: 'rocket', text: "Are your dispatchers still copy-pasting customer addresses into courier portals? 🚚" },
      variants: [
        { reaction: 'thumbs_up', text: "How automated webhook retries prevent lost parcels when courier APIs go down ⚡" },
        { reaction: 'shield',    text: "Did you know COD fraud scoring can flag fake phone numbers before shipping? 🛡️" },
        { reaction: 'cool',      text: "Auto-generate shipping labels and SMS tracking IDs the second an order lands! 📦" }
      ]
    },

    // Blog 6: Custom POS vs Ready-Made Software
    {
      name: "Custom POS vs Ready-Made Software",
      match: path => path.includes('custom-pos-vs-ready-made-software'),
      welcome: { reaction: 'builder', text: "Why do 90% of cloud POS systems freeze the moment internet drops during rush hour? 🛒" },
      variants: [
        { reaction: 'peace',  text: "Tired of $30/mo per register? Custom architecture eliminates recurring seat fees! 🧾" },
        { reaction: 'coffee', text: "Offline-first IndexedDB syncing to central Laravel API when connection restores ☕" },
        { reaction: 'flex',   text: "Built to survive massive Eid & Black Friday retail rushes without crashing! 💪" }
      ]
    },

    // Blog 7: Single vs Multi-Database SaaS Multi-Tenancy
    {
      name: "Single vs Multi-Database Multi-Tenancy",
      match: path => path.includes('single-vs-multi-database-saas-multitenancy'),
      welcome: { reaction: 'thinking', text: "At 1,000 SaaS tenants, will your single DB melt or your connection pool drain? 🏢" },
      variants: [
        { reaction: 'builder', text: "Single DB with Tenant ID vs Database-Per-Tenant: which saves your compliance? 🗄️" },
        { reaction: 'debug',   text: "How do you migrate 500 isolated tenant databases in under 3 minutes? ⏱️" },
        { reaction: 'rock',    text: "Data isolation vs infrastructure cost—choose the battle that fits your seed stage! 🤘" }
      ]
    },

    // Blog 8: Offline-First Expense Tracker PWA
    {
      name: "Offline-First Expense Tracker PWA",
      match: path => path.includes('offline-first-expense-tracker-pwa'),
      welcome: { reaction: 'idea', text: "Can you build an offline personal finance app with AI on a tiny 256MB VPS? 💡" },
      variants: [
        { reaction: 'coding',    text: "How IndexedDB stores receipts locally and executes idempotent syncs online 📱" },
        { reaction: 'cool',      text: "Zero-cost AI expense parsing extracting merchants & totals without paid API bills! ⚡" },
        { reaction: 'thumbs_up', text: "Works flawlessly in underground warehouse basements with zero network signal! 📶" }
      ]
    },

    // Blog 9: Laravel Queue Workers in Docker Production
    {
      name: "Laravel Queue Workers in Docker",
      match: path => path.includes('laravel-queue-worker-docker-production'),
      welcome: { reaction: 'builder', text: "Why do Docker queue workers silently die or leak memory after 3 days in prod? 🐳" },
      variants: [
        { reaction: 'shield', text: "Are your containers ignoring SIGTERM and killing database jobs mid-transaction? 🛡️" },
        { reaction: 'debug',  text: "Why queue:listen leaks memory while queue:work with --max-jobs saves your server 🔍" },
        { reaction: 'coffee', text: "Proper Supervisord process management inside Alpine Docker containers ☕" }
      ]
    },

    // Blog 10: Laravel Observer Pattern & Audit Log
    {
      name: "Laravel Observer Pattern",
      match: path => path.includes('laravel-observer-pattern-audit-log'),
      welcome: { reaction: 'debug', text: "Who altered the customer's payout bank account at 2 AM? Is your audit log solid? 🕵️" },
      variants: [
        { reaction: 'shield', text: "Why Model Observers beat messy MySQL database triggers for business audit trails 📝" },
        { reaction: 'coding', text: "How to capture dirty model attributes before and after mutations cleanly in Laravel 🔒" },
        { reaction: 'cool',   text: "Store immutable historical snapshots with automated actor IP and User-Agent tracking! 😎" }
      ]
    },

    // Blog 11: Laravel AI SDK & OpenRouter
    {
      name: "Laravel AI SDK & OpenRouter",
      match: path => path.includes('laravel-ai-sdk-openrouter'),
      welcome: { reaction: 'idea', text: "What happens when OpenAI has an outage? Can your app instantly failover to Claude? 🤖" },
      variants: [
        { reaction: 'coding',    text: "How the Laravel AI SDK unifies LLM calls across Gemini, Claude & GPT via OpenRouter 🔄" },
        { reaction: 'shield',    text: "Background queue processing for long LLM reasoning chains to prevent HTTP 504 timeouts ⛓️" },
        { reaction: 'celebrate', text: "Build intelligent autonomous agents in Laravel without changing SDKs! 🎉" }
      ]
    },

    // Blog 12: Laravel Queue vs defer()
    {
      name: "Laravel Queue vs defer()",
      match: path => path.includes('laravel-queue-vs-defer'),
      welcome: { reaction: 'thinking', text: "When should you spin up Redis workers, and when is Laravel's native defer() enough? ⚖️" },
      variants: [
        { reaction: 'coding',  text: "Did you know defer() executes right after HTTP response flush with zero Redis daemon? ⚡" },
        { reaction: 'coffee',  text: "Database transactions + defer(): watch out for uncommitted state gotchas! ☕" },
        { reaction: 'reading', text: "Heavy PDF generation or emails? Don't cheat—send them to proper Queues! 🐘" }
      ]
    },

    // Blog 13: Laravel Sanctum Tutorial
    {
      name: "Laravel Sanctum Tutorial",
      match: path => path.includes('laravel-sanctum-tutorial'),
      welcome: { reaction: 'shield', text: "Confused about stateful SPA cookies vs Bearer tokens in mobile apps? Sanctum does both! 🔐" },
      variants: [
        { reaction: 'reading',   text: "How CSRF double-submit cookies protect your Vue/React frontend from session hijacking 🔑" },
        { reaction: 'thumbs_up', text: "Token ability scopes: limiting third-party API keys to strictly read-only permissions! 🎯" },
        { reaction: 'flex',      text: "Instant revocation: kick unauthorized devices out with a single database query! 💪" }
      ]
    },

    // Blog 14: Laravel 13 Roadmap & Features
    {
      name: "Laravel 13 Roadmap & Features",
      match: path => path.includes('laravel-13-new-features'),
      welcome: { reaction: 'idea', text: "Ready for PHP 8.3+ requirements, native attributes, and Reverb DB driver in Laravel 13? 🔮" },
      variants: [
        { reaction: 'reading', text: "Property hooks and asymmetric visibility: how PHP 8.4 syntax cleans Eloquent models ⚙️" },
        { reaction: 'builder', text: "What deprecated features will break your app on upgrade? Let's audit them beforehand! 🛠️" },
        { reaction: 'rocket',  text: "Seamless upgrade blueprints to future-proof your production codebases! 🚀" }
      ]
    },

    // Blog 15: Real-time Notifications & Soketi
    {
      name: "Real-time Notifications & Soketi",
      match: path => path.includes('laravel-realtime-notifications-pusher-fcm-soketi'),
      welcome: { reaction: 'rocket', text: "Pusher billing $200/mo for WebSockets? Did you know Soketi and Reverb are completely free? 📡" },
      variants: [
        { reaction: 'builder',   text: "Soketi handles 10,000 concurrent socket connections on a $5 VPS with zero lag 🚀" },
        { reaction: 'thumbs_up', text: "Unified push pipelines sending FCM alerts to mobile and browser webhooks simultaneously 📲" },
        { reaction: 'peace',     text: "Real-time order statuses, live counters, and team chat without recurring bills! ✌️" }
      ]
    },

    // Blog 16: Laravel Queues, Jobs & Redis Horizon
    {
      name: "Queues, Jobs & Redis Horizon",
      match: path => path.includes('laravel-queues-jobs-redis-horizon'),
      welcome: { reaction: 'coding', text: "How do you process 500,000 background jobs a day without frying your database? ⏳" },
      variants: [
        { reaction: 'rocket', text: "Redis Horizon dashboard: real-time wait times, throughput charts & auto-balancing workers 🚀" },
        { reaction: 'shield', text: "Exponential backoff and jitter algorithms: stopping retry storms when APIs fail 🛡️" },
        { reaction: 'flex',   text: "Tagging jobs by tenant and customer for granular debugging during high traffic! 💪" }
      ]
    },

    // Blog 17: Laravel OpenAI Integration Guide
    {
      name: "Laravel OpenAI Integration",
      match: path => path.includes('laravel-openai-integration-guide'),
      welcome: { reaction: 'idea', text: "Want ChatGPT-style word-by-word streaming in your app instead of waiting 15 seconds? ⚡" },
      variants: [
        { reaction: 'coding',    text: "Server-Sent Events (SSE) streaming tokens straight to frontend reactive stores! 💬" },
        { reaction: 'thumbs_up', text: "Enforcing strict JSON Schema responses so the LLM never returns corrupted output 🎯" },
        { reaction: 'coffee',    text: "Token cost control: calculating prompt vs completion token burn rate in real time ☕" }
      ]
    },

    // Blog 18: Laravel 12.39 Features
    {
      name: "Laravel 12.39 Features",
      match: path => path.includes('laravel-12-39-new-features'),
      welcome: { reaction: 'reading', text: "Checked out the new @hasStack Blade directive and streamlined route filtering in 12.39? 🆕" },
      variants: [
        { reaction: 'coding',    text: "Avoid loading heavy JavaScript bundles on pages that don't push to specific stacks! 🪄" },
        { reaction: 'thumbs_up', text: "Small framework refinements that make day-to-day developer experience silky smooth 🚀" },
        { reaction: 'cool',      text: "Keep your Laravel micro-versions updated for silent bug fixes and security hardening! 😎" }
      ]
    },

    // Blog 19: Laravel Performance Optimization
    {
      name: "Laravel Performance Optimization",
      match: path => path.includes('laravel-performance-optimization'),
      welcome: { reaction: 'rocket', text: "How do we get Laravel API response times consistently under 80 milliseconds? 🏎️" },
      variants: [
        { reaction: 'cool',     text: "OPcache JIT, route caching, and config preloading: unlocking pure compiled execution! 🚀" },
        { reaction: 'thinking', text: "Is your bottleneck CPU or database I/O? Profiling with Laravel Pulse reveals the truth 🔭" },
        { reaction: 'flex',     text: "Eliminating bloated model hydrations by selecting only necessary table columns! 💪" }
      ]
    },

    // Blog 20: MySQL Query Optimization in Laravel
    {
      name: "MySQL Query Optimization in Laravel",
      match: path => path.includes('mysql-query-optimization-laravel'),
      welcome: { reaction: 'debug', text: "Are your SQL queries taking 3 seconds? Have you checked if your composite index order is wrong? 📊" },
      variants: [
        { reaction: 'cool',    text: "The Leftmost Prefix rule: why INDEX(status, created_at) won't optimize created_at alone! ⚡" },
        { reaction: 'reading', text: "Reading EXPLAIN FORMAT=JSON: how to spot 'Using temporary' and 'Using filesort' red flags 🔍" },
        { reaction: 'builder', text: "Stop looping queries inside Blade! Eager load relations and watch page load times plummet! 🛠️" }
      ]
    },

    // Blog 21: Laravel Docker & Kubernetes Deployment
    {
      name: "Laravel Docker & Kubernetes Deployment",
      match: path => path.includes('laravel-docker-kubernetes-deployment'),
      welcome: { reaction: 'builder', text: "How do you deploy new code with zero downtime and zero dropped HTTP connections? ☸️" },
      variants: [
        { reaction: 'coding', text: "Multi-stage Docker builds: keeping secrets out of production and images under 80MB! 📦" },
        { reaction: 'shield', text: "Kubernetes readiness & liveness probes: never route users to a booting PHP-FPM worker 🛡️" },
        { reaction: 'flex',   text: "Horizontal Pod Autoscalers (HPA) handling viral traffic spikes automatically! 💪" }
      ]
    },

    // Blog 22: Laravel REST API Best Practices
    {
      name: "Laravel REST API Best Practices",
      match: path => path.includes('laravel-rest-api-best-practices'),
      welcome: { reaction: 'reading', text: "What separates a junior API from an enterprise-grade REST architecture? 📐" },
      variants: [
        { reaction: 'coding',    text: "API Resources, strict HTTP status codes, and unified error envelopes! 📄" },
        { reaction: 'thumbs_up', text: "Rate limiting by user tier and semantic versioning without breaking mobile apps 📱" },
        { reaction: 'shield',    text: "Form Request authorization and input normalization before controllers even run 🛡️" }
      ]
    },

    // Blog 23: Laravel MVCS Architecture Guide
    {
      name: "Laravel MVCS Architecture Guide",
      match: path => path.includes('laravel-mvcs-architecture-guide'),
      welcome: { reaction: 'builder', text: "Are your controllers turning into 1,200-line 'Fat Controller' spaghetti monsters? 🏛️" },
      variants: [
        { reaction: 'cool',      text: "Skinny controllers, single-responsibility Services, and pure Action classes! 🧹" },
        { reaction: 'coding',    text: "Isolate core business logic from HTTP so it can run via CLI, Webhooks, or Queue 🧪" },
        { reaction: 'thumbs_up', text: "Writing unit tests for pure services becomes 10x faster and painless! 🤝" }
      ]
    },

    // Blog 24: Laravel Sanctum vs JWT
    {
      name: "Laravel Sanctum vs JWT",
      match: path => path.includes('laravel-api-authentication-jwt-sanctum'),
      welcome: { reaction: 'shield', text: "Stateless JWT vs Database-backed Sanctum tokens: Which one should you really choose? 🛡️" },
      variants: [
        { reaction: 'thinking', text: "What if a user's phone is stolen? How do you revoke a stateless JWT before expiration? 🚨" },
        { reaction: 'cool',     text: "Sanctum gives instant database revocation; JWT saves database query overhead. Choose wisely! 🎯" },
        { reaction: 'flex',     text: "Hybrid architecture: short-lived JWTs paired with refresh token rotation! 💪" }
      ]
    },

    // Blog 25: PHP Coding Standards
    {
      name: "PHP Coding Standards",
      match: path => path.includes('php-coding-standards-bangladesh-developers'),
      welcome: { reaction: 'reading', text: "Does your team follow strict PSR-12 and static analysis, or is everyone formatting their own way? 💎" },
      variants: [
        { reaction: 'coding',    text: "Enforcing declare(strict_types=1); and PHPStan Level 8 catches 70% of runtime bugs before QA! 🧼" },
        { reaction: 'thumbs_up', text: "Automated Git pre-commit hooks running Laravel Pint ensure zero styling arguments in PRs 🌍" },
        { reaction: 'rock',      text: "Write readable, self-documenting code that international engineering teams love to hire! 🤘" }
      ]
    },

    // ------------------------------------------------------------------------
    // Homepage (Fallback Default)
    // ------------------------------------------------------------------------
    {
      name: "Homepage",
      match: () => true,
      welcome: { reaction: 'salam', text: "Assalamu Alaikum! Welcome to Polash's engineering portfolio! 👋" },
      variants: [
        { reaction: 'waving',    text: "Hi there! Feel free to explore my open source projects & architectures! 🚀" },
        { reaction: 'cool',      text: "APIs engineered for sub-100ms response times guaranteed! ⚡" },
        { reaction: 'coding',    text: "I build robust systems that don't break under real production load 💻" },
        { reaction: 'thumbs_up', text: "Available for remote roles & SaaS architecture contracts worldwide! 🤝" },
        { reaction: 'coffee',    text: "Clean architecture, automated tests, zero drama ☕" },
        { reaction: 'flex',      text: "Databases indexed & high-concurrency bottlenecks eliminated! 📊" },
        { reaction: 'salam',     text: "Assalamu Alaikum! Kamruzzaman Polash at your service! 🤝" }
      ]
    }
  ];

  function getPageContext() {
    const path = (window.location.pathname || '/').toLowerCase();
    for (const ctx of SCENARIOS) {
      if (typeof ctx.match === 'function' && ctx.match(path)) return ctx;
      if (typeof ctx.match === 'string' && path.includes(ctx.match)) return ctx;
    }
    return SCENARIOS[SCENARIOS.length - 1];
  }

  function getCellPosition(index) {
    const x = (index % 3) * 50;
    const y = Math.floor(index / 3) * 50;
    return `${x}% ${y}%`;
  }

  function wrapAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function ensureStyles() {
    if (!document.querySelector('link[href*="mascot.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/css/mascot.css?v=10';
      document.head.appendChild(link);
    }
  }

  function mountDOM() {
    if (!document.getElementById('page-mascot')) {
      const mascot = document.createElement('div');
      mascot.className = 'page-mascot';
      mascot.id = 'page-mascot';
      mascot.setAttribute('aria-live', 'polite');
      mascot.innerHTML = `
        <div class="page-mascot__dock">
          <div class="page-mascot__tooltip" id="page-mascot-tooltip" role="tooltip" aria-hidden="true">
            <span class="page-mascot__tooltip-dot" id="page-mascot-tooltip-dot"></span>
            <span class="page-mascot__tooltip-text" id="page-mascot-tooltip-text">Available · Click to chat or poke!</span>
          </div>
          <div class="page-mascot__bubble" id="page-mascot-bubble" role="tooltip" aria-hidden="true">
            <span class="page-mascot__bubble-text" id="page-mascot-text">Click or poke me! 👋</span>
            <div class="page-mascot__bubble-action" id="page-mascot-bubble-action">
              <button type="button" class="page-mascot__bubble-cta" id="page-mascot-cta" title="Live Chat" data-action="chat">
                <span class="page-mascot__bubble-dot" id="page-mascot-bubble-dot"></span>
                <span id="page-mascot-cta-text">Live Chat</span>
              </button>
            </div>
          </div>
          <button type="button" class="page-mascot__btn" id="page-mascot-btn" aria-label="Poke Polash mascot">
            <span class="page-mascot__status-dot" id="page-mascot-status-dot" aria-hidden="true"></span>
            <span class="page-mascot__unread" id="page-mascot-unread" hidden></span>
            <div class="page-mascot__squash" id="page-mascot-squash">
              <div class="page-mascot__layer page-mascot__layer--directions" id="mascot-layer-directions"></div>
              <div class="page-mascot__layer page-mascot__layer--reactions" id="mascot-layer-reactions"></div>
              <div class="page-mascot__layer page-mascot__layer--actions" id="mascot-layer-actions"></div>
              <div class="page-mascot__layer page-mascot__layer--actions-2" id="mascot-layer-actions-2"></div>
            </div>
          </button>
        </div>
      `.trim();
      document.body.appendChild(mascot);
    }

    if (!document.getElementById('mascot-fx-canvas')) {
      const canvas = document.createElement('canvas');
      canvas.id = 'mascot-fx-canvas';
      canvas.className = 'mascot-fx-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
    }
  }

  function initMascot() {
    ensureStyles();
    mountDOM();

    const mascot = document.getElementById('page-mascot');
    const btn = document.getElementById('page-mascot-btn');
    const squash = document.getElementById('page-mascot-squash');
    const layerDir = document.getElementById('mascot-layer-directions');
    const layerReact = document.getElementById('mascot-layer-reactions');
    const layerActions1 = document.getElementById('mascot-layer-actions');
    const layerActions2 = document.getElementById('mascot-layer-actions-2');
    const bubble = document.getElementById('page-mascot-bubble');
    const bubbleText = document.getElementById('page-mascot-text');
    const canvas = document.getElementById('mascot-fx-canvas');

    if (!mascot || !btn || !layerDir || !layerReact) return;

    let direction = 'center';
    let reaction = null;
    let timers = [];
    let boops = { count: 0, at: 0 };
    let payoffIdx = 0;
    let bubbleTimer = 0;
    let sector = -1;
    let pointer = null;

    const statusDot = document.getElementById('page-mascot-status-dot');
    const unreadBadge = document.getElementById('page-mascot-unread');
    const bubbleDot = document.getElementById('page-mascot-bubble-dot');
    const ctaText = document.getElementById('page-mascot-cta-text');
    const bubbleAction = document.getElementById('page-mascot-bubble-action');
    const ctaBtn = document.getElementById('page-mascot-cta');
    const tooltipDot = document.getElementById('page-mascot-tooltip-dot');
    const tooltipText = document.getElementById('page-mascot-tooltip-text');

    let currentChatStatus = 'available';
    let isChatVisible = true;

    function applyChatStatus(status) {
      currentChatStatus = status || 'available';
      const isAway = currentChatStatus === 'away';
      if (statusDot) statusDot.classList.toggle('is-away', isAway);
      if (bubbleDot) bubbleDot.style.background = isAway ? '#f59e0b' : '#10b981';
      if (ctaText) {
        ctaText.textContent = isAway ? 'Leave a Message' : 'Live Chat';
      }
      if (ctaBtn) {
        ctaBtn.title = isAway ? 'Leave a Message' : 'Live Chat';
      }

      if (tooltipDot) {
        tooltipDot.style.display = 'inline-block';
        tooltipDot.classList.toggle('is-away', isAway);
      }
      if (tooltipText) {
        tooltipText.textContent = isAway ? 'Away · Click to leave a message' : 'Available · Click to chat or poke!';
      }
    }

    function applyChatVisibility(visibility) {
      isChatVisible = (visibility !== 'hidden');
      mascot.classList.toggle('chat--hidden', !isChatVisible);
      if (ctaBtn) {
        if (!isChatVisible) {
          ctaBtn.setAttribute('data-action', 'whatsapp');
          if (bubbleDot) bubbleDot.style.display = 'none';
          if (ctaText) ctaText.textContent = 'WhatsApp';
          ctaBtn.title = 'WhatsApp Polash';
          if (tooltipDot) tooltipDot.style.display = 'none';
          if (tooltipText) tooltipText.textContent = '👋 Click to explore & interact!';
        } else {
          ctaBtn.setAttribute('data-action', 'chat');
          if (bubbleDot) bubbleDot.style.display = 'inline-block';
          applyChatStatus(currentChatStatus);
        }
      }
    }

    // Check initial state from DOM
    const launcherDot = document.getElementById('live-chat-launcher-dot');
    if (launcherDot && launcherDot.classList.contains('is-away')) {
      applyChatStatus('away');
    }
    const initialChatWidget = document.getElementById('live-chat');
    if (initialChatWidget && (initialChatWidget.classList.contains('live-chat--hidden') || initialChatWidget.style.display === 'none')) {
      applyChatVisibility('hidden');
    }

    document.addEventListener('chat:status', (e) => {
      if (e.detail && e.detail.status) applyChatStatus(e.detail.status);
    });

    document.addEventListener('chat:visibility', (e) => {
      if (e.detail && e.detail.visibility) applyChatVisibility(e.detail.visibility);
    });

    document.addEventListener('chat:unread', (e) => {
      if (!unreadBadge) return;
      const count = (e.detail && e.detail.count) || 0;
      if (count > 0) {
        unreadBadge.hidden = false;
        unreadBadge.removeAttribute('hidden');
        unreadBadge.textContent = count > 9 ? '9+' : String(count);
        showBubble("Polash sent a new message! 💬", 5500);
      } else {
        unreadBadge.hidden = true;
        unreadBadge.setAttribute('hidden', '');
        unreadBadge.textContent = '';
      }
    });

    // Web Audio Synthesizer
    let audioCtx = null;
    function playBoopSound(pitch) {
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        const startFreq = pitch || 460;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.85, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    // Particle Emitter
    let ctx = null;
    let particles = [];
    const EMOJIS = ['❤️', '✨', '⭐', '🎉', '🚀', '⚡', '☕', '🔥', '💡', '🛡️'];

    if (canvas && canvas.getContext) {
      ctx = canvas.getContext('2d');
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeCanvas, { passive: true });
      resizeCanvas();

      function loopParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.14;
          p.alpha -= p.decay;
          p.rotation += p.vRot;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
          ctx.restore();
        }
        requestAnimationFrame(loopParticles);
      }
      requestAnimationFrame(loopParticles);
    }

    function spawnBurst(x, y, isDizzy) {
      if (!ctx) return;
      const count = isDizzy ? 20 : 12;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 3.5 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.02,
          size: 14 + Math.random() * 8,
          emoji: isDizzy ? '💫' : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.12,
        });
      }
    }

    function updateView() {
      const dirIdx = DIRECTIONS.indexOf(direction);
      layerDir.style.backgroundPosition = getCellPosition(dirIdx >= 0 ? dirIdx : 4);

      const act1Idx = ACTIONS_1.indexOf(reaction);
      const act2Idx = ACTIONS_2.indexOf(reaction);
      const reactIdx = REACTIONS.indexOf(reaction);

      if (layerActions1 && act1Idx >= 0) {
        layerActions1.style.backgroundPosition = getCellPosition(act1Idx);
        layerActions1.style.opacity = '1';
        if (layerActions2) layerActions2.style.opacity = '0';
        layerReact.style.opacity = '0';
        layerDir.style.opacity = '0';
      } else if (layerActions2 && act2Idx >= 0) {
        layerActions2.style.backgroundPosition = getCellPosition(act2Idx);
        layerActions2.style.opacity = '1';
        if (layerActions1) layerActions1.style.opacity = '0';
        layerReact.style.opacity = '0';
        layerDir.style.opacity = '0';
      } else if (reactIdx >= 0) {
        layerReact.style.backgroundPosition = getCellPosition(reactIdx);
        layerReact.style.opacity = '1';
        if (layerActions1) layerActions1.style.opacity = '0';
        if (layerActions2) layerActions2.style.opacity = '0';
        layerDir.style.opacity = '0';
      } else {
        if (layerActions1) layerActions1.style.opacity = '0';
        if (layerActions2) layerActions2.style.opacity = '0';
        layerReact.style.opacity = '0';
        layerDir.style.opacity = '1';
      }
    }

    function aim() {
      if (!pointer) return;
      const box = btn.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1;
        direction = 'center';
        updateView();
        return;
      }

      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrapAngle(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return;
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      direction = CLOCKWISE[sector];
      updateView();
    }

    window.addEventListener('pointermove', (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      aim();
    }, { passive: true });

    window.addEventListener('scroll', aim, { passive: true });

    let isHoveringBubble = false;
    if (bubble) {
      bubble.addEventListener('mouseenter', () => {
        isHoveringBubble = true;
      });
      bubble.addEventListener('mouseleave', () => {
        isHoveringBubble = false;
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
          mascot.classList.remove('is-talking');
          reaction = null;
          updateView();
        }, 1800);
      });
    }

    function showBubble(text, duration) {
      if (!bubble || !bubbleText) return;
      const chatWidget = document.getElementById('live-chat');
      if (chatWidget && chatWidget.classList.contains('is-open')) {
        return; // Suppress bubble while chat window is active
      }
      clearTimeout(bubbleTimer);
      bubbleText.textContent = text;

      if (bubbleAction) {
        bubbleAction.style.display = 'flex';
      }

      mascot.classList.add('is-talking');
      bubbleTimer = setTimeout(() => {
        if (!isHoveringBubble) {
          mascot.classList.remove('is-talking');
        }
      }, duration || 6000);
    }

    // Friendly Context-Aware first-visit greeting per page
    function greetFirstVisit() {
      try {
        const cleanPath = window.location.pathname.replace(/\/$/, '') || '/';
        const sessionKey = 'mascot_greeted_' + cleanPath;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
          const pageCtx = getPageContext();
          setTimeout(() => {
            const welcomeDuration = 6500;
            reaction = pageCtx.welcome.reaction || 'salam';
            updateView();
            showBubble(pageCtx.welcome.text, welcomeDuration);
            if (squash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              squash.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' });
            }
            setTimeout(() => {
              if (!isHoveringBubble) {
                reaction = null;
                updateView();
              }
            }, welcomeDuration);
          }, 1200);
        }
      } catch (e) {}
    }

    function boop(e) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clickX = (e && e.clientX) || cx;
      const clickY = (e && e.clientY) || cy;

      timers.forEach(window.clearTimeout);
      timers = [];

      const later = (ms, next) => {
        timers.push(window.setTimeout(() => {
          if (!isHoveringBubble || next !== null) {
            reaction = next;
            updateView();
          }
        }, ms));
      };

      const now = Date.now();
      boops.count = now - boops.at < DIZZY_WINDOW ? boops.count + 1 : 1;
      boops.at = now;

      if (boops.count >= DIZZY_AFTER) {
        boops.count = 0;
        reaction = 'dizzy';
        updateView();
        playBoopSound(320);
        spawnBurst(clickX, clickY, true);
        const dizzyDuration = 3200;
        later(dizzyDuration, null);
        showBubble("Whoa! High load dizzy mode! 😵‍💫", dizzyDuration);
      } else {
        const pageCtx = getPageContext();
        const variant = pageCtx.variants[payoffIdx++ % pageCtx.variants.length];
        const clickDuration = 5500;

        reaction = 'blink';
        updateView();
        playBoopSound(460 + (payoffIdx % 3) * 60);
        spawnBurst(clickX, clickY, false);
        later(BOOP_PAYOFF, variant.reaction || 'delighted');
        later(clickDuration, null);
        showBubble(variant.text, clickDuration);
      }

      // If there are unread messages from Polash, clicking mascot opens chat directly!
      if (unreadBadge && !unreadBadge.hidden && unreadBadge.textContent !== '') {
        const toggleBtn = document.getElementById('live-chat-toggle');
        if (toggleBtn) {
          toggleBtn.click();
          return;
        }
      }

      if (squash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        squash.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' });
      }
    }

    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(bubbleTimer);
        mascot.classList.remove('is-talking');
        if (ctaBtn.getAttribute('data-action') === 'whatsapp') {
          window.open('https://wa.me/8801791296967?text=' + encodeURIComponent('Hi Polash, I would like to discuss a project.'), '_blank', 'noopener,noreferrer');
          return;
        }
        const toggleBtn = document.getElementById('live-chat-toggle');
        if (toggleBtn) {
          toggleBtn.click();
        }
      });
    }

    const chatToggle = document.getElementById('live-chat-toggle');
    if (chatToggle) {
      chatToggle.addEventListener('click', () => {
        clearTimeout(bubbleTimer);
        mascot.classList.remove('is-talking');
      });
    }

    const chatClose = document.getElementById('live-chat-close');
    if (chatClose) {
      chatClose.addEventListener('click', () => {
        clearTimeout(bubbleTimer);
        mascot.classList.remove('is-talking');
      });
    }

    btn.addEventListener('click', boop);
    updateView();
    greetFirstVisit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMascot, { once: true });
  } else {
    initMascot();
  }
})();
