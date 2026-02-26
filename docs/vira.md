# Vira

Fetch daily content from [Vira](https://m.liulishuo.com/en/vira.html).

## Open in browser

Generate URL

```bash
LOGIN=<YOUR_LOGIN_ID>
DEVICE_ID=<YOUR_DEVICE_ID>
TOKEN=<YOUR_VIRA_TOKEN>

# echo ""
# echo ""
# echo "https://reading.liulishuo.com/book/store?webview=x5&appVersion=2.29.21&userInterfaceStyle=1&platform=iOS&appId=vira&login=$LOGIN&deviceId=$DEVICE_ID&sDeviceId=$DEVICE_ID&token=$TOKEN"

echo ""
echo ""
echo "https://reading.liulishuo.com/journals/NGVjMDAwMDAwMDAwMTUzYg==/audio?webview=x5&appVersion=2.29.21&userInterfaceStyle=1&platform=iOS&appId=vira&&platform=iOS&appId=vira&login=$LOGIN&deviceId=$DEVICE_ID&sDeviceId=$DEVICE_ID&token=$TOKEN"

echo ""
echo ""
echo "https://reading.liulishuo.com/journals/NGVjMDAwMDAwMDAwMTUzYg==/explanation?webview=x5&appVersion=2.29.21&userInterfaceStyle=1&platform=iOS&appId=vira&&platform=iOS&appId=vira&login=$LOGIN&deviceId=$DEVICE_ID&sDeviceId=$DEVICE_ID&token=$TOKEN"
```

### Recommended fix (Userscript)

Use Tampermonkey/Violentmonkey with `@run-at document-start` to patch `fetch` and `XMLHttpRequest` before app scripts run.

```js
// ==UserScript==
// @name         vira-webview-bridge
// @match        https://reading.liulishuo.com/*
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';
  const q = new URL(location.href).searchParams;
  const token = q.get('token') || '';
  const appId = q.get('appId') || 'vira';
  const login = q.get('login') || '';
  const deviceId = q.get('deviceId') || q.get('sDeviceId') || '';

  const patchUrl = (raw) => {
    const u = new URL(raw, location.origin);
    if (!u.hostname.includes('vira.llsapp.com')) return null;
    if (token && !u.searchParams.get('token')) u.searchParams.set('token', token);
    if (!u.searchParams.get('appId')) u.searchParams.set('appId', appId);
    if (login && !u.searchParams.get('login')) u.searchParams.set('login', login);
    if (deviceId && !u.searchParams.get('deviceId')) u.searchParams.set('deviceId', deviceId);
    if (deviceId && !u.searchParams.get('sDeviceId')) u.searchParams.set('sDeviceId', deviceId);
    return u.toString();
  };

  const fillHeaders = (h) => {
    if (token) h.set('Authorization', `Bearer ${token}`);
    h.set('X-App-Id', appId);
    if (login) h.set('X-Login', login);
    if (deviceId) {
      h.set('X-Device-Id', deviceId);
      h.set('X-S-Device-Id', deviceId);
    }
  };

  const _fetch = window.fetch;
  window.fetch = (input, init = {}) => {
    const req = input instanceof Request ? input : null;
    const raw = req ? req.url : String(input);
    const patched = patchUrl(raw);
    if (!patched) return _fetch(input, init);
    const headers = new Headers((req ? req.headers : init.headers) || {});
    // exclude api/v2/bookstore
    if (!patched.includes('api/v2/bookstore')) fillHeaders(headers);
    if (req) return _fetch(new Request(patched, req), { ...init, headers });
    return _fetch(patched, { ...init, headers });
  };

  const _open = XMLHttpRequest.prototype.open;
  const _set = XMLHttpRequest.prototype.setRequestHeader;
  const _send = XMLHttpRequest.prototype.send;
  const target = new WeakMap();
  const OVERRIDE_HEADERS = ['Authorization', 'X-App-Id', 'X-Login', 'X-Device-Id', 'X-S-Device-Id'];

  // setRequestHeader appends on duplicate names (spec). Page may set these first, then we append in send() -> "value1, value2".
  // Intercept so we set our value once; page's setRequestHeader for these is ignored.
  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (name === 'Authorization' && value.trim() === 'Bearer undefined') return;
    return _set.call(this, name, value);
  };

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    // exclude api/v2/bookstore
    if (url.includes('api/v2/bookstore')) {
        target.set(this, false)
        const patched = patchUrl(String(url));
        return _open.call(this, method, patched, ...rest);
    }
    try {
      const patched = patchUrl(String(url));
      target.set(this, !!patched);
      return _open.call(this, method, patched || url, ...rest);
    } catch {
      target.set(this, false);
      return _open.call(this, method, url, ...rest);
    }
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (target.get(this)) {
      if (token) _set.call(this, 'Authorization', `Bearer ${token}`);
      _set.call(this, 'X-App-Id', appId);
      if (login) _set.call(this, 'X-Login', login);
      if (deviceId) {
        _set.call(this, 'X-Device-Id', deviceId);
        _set.call(this, 'X-S-Device-Id', deviceId);
      }
    } else {
      console.log(this)
      // Do not set these headers for bookstore requests:
      // X-App-Id, X-Device-Id, X-Login, X-S-Device-Id
    }
    return _send.call(this, body);
  };
})();
```

### DevTools-only option

No extension is needed, but less convenient:

- Use `Sources -> Overrides`, override the `book/store` HTML shell.
- Inject the same patch script in a top-level `<script>` before app bundles.
- Reload page.

## Quick troubleshoot

- Confirm required query + headers exist on `vira.llsapp.com` requests in Network tab.
- If fields are complete and still `401`, token is likely expired.
