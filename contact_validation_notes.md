# Contact Form Validation Notes

- The published `/contact` form targets `https://formsubmit.co/akmdaniel2@gmail.com` and includes the `_honey` hidden spam trap.
- The published DOM did **not** include the required `_captcha=false` hidden field after checkpoint `fe4ed90b`.
- The no-CAPTCHA configuration must be corrected and re-published before the final end-to-end Contact delivery verification.
- A direct fetch of the deployed JavaScript bundle after checkpoint `fe4ed90b` confirms that `_captcha` is present. The browser session is therefore serving stale client assets and must be refreshed before its live DOM can be used as final verification.
- A subsequent cache-busting navigation and hard refresh still rendered an older Contact DOM without `_captcha`; the live asset URL and client resource cache must be compared before the current browser session can be used for final UI verification.
- The browser loaded `index-BYeV94Ym.js`, while a direct public fetch returned `index-fUb861IH.js` containing `_captcha`. Cache Storage and Service Worker registrations were empty, confirming the stale asset is being served outside the browser-managed caches.
