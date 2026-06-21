/**
 * Lightweight, BYO-endpoint analytics. By default it just logs to the
 * console (so you can verify events firing in DevTools without setting
 * anything up). Set localStorage["analytics-endpoint"] to a POST URL
 * (your own server, Plausible-compatible, etc.) to actually report.
 *
 * Events are deliberately small and have no PII beyond a stable but
 * anonymous per-browser visitor id.
 */
(function (root) {
  const KEY_ENDPOINT = 'analytics-endpoint';
  const KEY_VISITOR = 'analytics-visitor-id';

  function visitorId() {
    let id = localStorage.getItem(KEY_VISITOR);
    if (!id) {
      id = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(KEY_VISITOR, id);
    }
    return id;
  }

  function endpoint() {
    return localStorage.getItem(KEY_ENDPOINT) || '';
  }

  function setEndpoint(url) {
    if (url) localStorage.setItem(KEY_ENDPOINT, url);
    else localStorage.removeItem(KEY_ENDPOINT);
  }

  function track(name, props) {
    const event = {
      name: String(name || 'event'),
      ts: Date.now(),
      page: location.pathname.split('/').pop() || 'index.html',
      visitor: visitorId(),
      props: props || {},
    };
    const url = endpoint();
    if (!url) {
      try { console.log('[analytics]', event.name, event.props); } catch (_) {}
      return;
    }
    try {
      const body = JSON.stringify(event);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
      }
    } catch (_) {}
  }

  root.Analytics = { track, setEndpoint, endpoint, visitorId };

  // Page view fires automatically on load.
  document.addEventListener('DOMContentLoaded', () => track('page_view'));
})(window);
