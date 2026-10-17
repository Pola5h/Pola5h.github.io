(function () {
  // Keep the trailing slash: without it the server redirects and the beacon can be lost
  var ENDPOINT = 'https://rootcode.alwaysdata.net/api/hit/';

  // Skip local development, automated browsers and "Do Not Track"
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  if (navigator.webdriver || navigator.doNotTrack === '1') return;

  // One hit per page load
  var body = JSON.stringify({ p: location.pathname, r: document.referrer });

  function send() {
    // text/plain keeps this a "simple" request, so there is no CORS preflight
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, body);
    } else {
      fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'cors' }).catch(function () {});
    }
  }

  // Wait for the page to finish loading, then for an idle moment, so tracking
  // never competes with the page's own resources
  function later() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(send, { timeout: 3000 });
    } else {
      setTimeout(send, 1500);
    }
  }

  if (document.readyState === 'complete') {
    later();
  } else {
    addEventListener('load', later);
  }
})();
