(function () {
  // Keep the trailing slash: without it the server redirects and the beacon can be lost
  var ENDPOINT = 'https://rootcode.alwaysdata.net/api/hit/';

  // Skip local development
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;

  // One hit per page load
  var payload = JSON.stringify({ p: location.pathname, r: document.referrer });

  function send() {
    var sent = false;

    // 1. Try sendBeacon first with text/plain Blob (avoids CORS preflight)
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
        sent = navigator.sendBeacon(ENDPOINT, blob);
      } catch (e) {
        sent = false;
      }
    }

    // 2. Fallback to fetch with keepalive and no-cors if sendBeacon was blocked, failed, or disabled by AdGuard
    if (!sent && window.fetch) {
      try {
        fetch(ENDPOINT, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          keepalive: true,
          mode: 'no-cors',
          credentials: 'omit'
        }).catch(function () {});
      } catch (e) {}
    }
  }

  // Execute immediately or on DOMContentLoaded (defer scripts already wait for DOM parse)
  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', send, { once: true });
  } else {
    send();
  }
})();
