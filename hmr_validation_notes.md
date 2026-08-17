# Development preview HMR verification

## 17 August 2026

The managed development preview reported a Vite client WebSocket disconnect after repeated server-restart cycles. The Vite configuration already uses the Express HTTP server for HMR, which is the compatible configuration for the managed preview tunnel.

The managed development service was restarted. It completed startup on port `3000`, and the preview page at the managed `3000-…manus.computer` URL loaded the full TalentBridgeHub home screen successfully after the restart. The Vite client connection log is being checked next.

The browser log subsequently reported **`[vite] connected.`**. A harmless stylesheet-only edit was then sent through the managed preview and the browser reported **`[vite] hot updated: /src/index.css`**. After removing the validation marker, the browser reported the same successful hot update again. No new **failed to connect to websocket** error occurred after the restart. The full regression suite passed: 15 test files and 30 tests, followed by a successful TypeScript check.

The issue was a stale development-preview HMR connection after server restart cycles, rather than an application Vite configuration defect. The existing bridge configuration correctly attaches HMR to the managed HTTP server; restarting the development service re-established its WebSocket tunnel. The published deployment was not changed by this preview-only recovery.
