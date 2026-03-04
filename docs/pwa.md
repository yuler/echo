# PWA Guide & Q&A

## What is PWA?

PWA (Progressive Web App) is a web application that uses modern web capabilities to deliver an app-like experience to users. PWAs can be installed on devices and work offline.

## Echo PWA Features

- **Installable** - Add to home screen on mobile or desktop
- **Offline Support** - Works without internet connection
- **Fast Loading** - Cached assets for quick access
- **App-like Experience** - Opens in standalone mode without browser UI

## Installing the App

### Desktop (Chrome/Edge)

1. Visit Echo in Chrome or Edge
2. Look for the install icon in the address bar (right side)
3. Click "Install Echo"
4. Echo will open in a separate window

### iOS (Safari)

1. Visit Echo in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap "Add" in the top right corner

### Android (Chrome)

1. Visit Echo in Chrome
2. Tap the three dots menu (top right)
3. Tap "Add to Home Screen" or "Install App"
4. Follow the prompts to install

## How It Works

### Manifest (`app/views/pwa/manifest.json.erb`)

The manifest file tells the browser how to install and display the app:

- `name` - Full app name
- `start_url` - URL to open when app launches
- `display` - Set to `standalone` for app-like experience
- `icons` - App icons for different contexts

### Service Worker (`app/views/pwa/service-worker.js`)

The service worker caches assets for offline use:

- Intercepts network requests
- Serves cached content when offline
- Enables background sync (future feature)

### Integration

PWA routes are defined in `config/routes.rb`:

```ruby
get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
```

The manifest is linked in `app/views/shared/_head.html.erb`.

---

## Q&A

### Q: The install button doesn't appear

**A:** Make sure:
- You're serving over HTTPS (or localhost)
- The manifest is valid and accessible
- Your browser supports PWA (Chrome, Edge, Safari, Firefox)

### Q: App doesn't work offline

**A:** Please try the following steps:

The current service worker implementation is minimal. For full offline support, we need to:
1. Configure asset caching strategy
2. Cache API responses
3. Implement offline fallback pages

### Q: How to update the app icon?

**A:** Replace `/icon.png` in the `public` folder with your new icon (512x512px minimum). The manifest references this file.

### Q: PWA not showing in Chrome on Android

**A:** 
1. Check Chrome flags: `chrome://flags/#app-banners`
2. Ensure manifest is valid at `/manifest.json`
3. Clear browser cache and refresh

### Q: Can I receive push notifications?

**A:** Please try the following steps:

The service worker includes push notification code (commented out). To enable:
1. Uncomment the push event listener in `service-worker.js`
2. Implement Web Push API on the server side
3. Add user permission request UI

### Q: How to test PWA locally?

**A:** Please try the following steps:

1. Run the development server
2. Open Chrome DevTools (F12)
3. Go to Application > Manifest to check manifest
4. Go to Application > Service Workers to check SW status
5. Use "Install" button in DevTools corner (if available)

### Q: PWA vs Native App

| Feature | PWA | Native |
|---------|-----|--------|
| Install | From browser | App Store |
| Updates | Automatic | User updates |
| Offline | Partial | Full |
| Hardware Access | Limited | Full |
| Distribution | No review | App Store review |

### Q: How to remove PWA from device?

- **iOS**: Long press icon > Remove Bookmark
- **Android**: Long press icon > App info > Uninstall
- **Desktop**: Right-click in apps list > Remove

---

## Future Improvements

- [ ] Add `short_name` to manifest
- [ ] Add app screenshots for install prompt
- [ ] Implement full offline caching strategy
- [ ] Enable push notifications
- [ ] Add app shortcuts for quick actions
- [ ] Configure update notification

## References

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [Chrome DevTools: PWA Auditing](https://developer.chrome.com/docs/devtools/progressive-web-apps)
