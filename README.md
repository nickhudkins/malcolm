# 👴🏻 Malcolm (in the Middle)

<p align="center">
  <img src="./logo.jpg" height="128" />
</p>

It's Man-In-The-Middle-Proxy for Development

### Usage

Create a `proxy.config.ts`:

```typescript

import { defineConfig } from "@nickhudkins/malcolm";
import { createProxyMiddleware } from "http-proxy-middleware";

export default defineConfig({
  hosts: ["google.com"],
  handleRequest: async (req) => {
    const url = new URL(req.url);
    return {
      ctx: {
        requestURL: url,
      }
    }
  },
  handleResponse: (
    res: PassThroughResponse,
    ctx
  ) => {
    // I have `ctx`! which is provided by the above
    return;
  },
  setupProxy: (app) => {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5000',
        changeOrigin: true,
      })
    );
  }
});
```

Run `malcolm`

### Development

1. Clone
1. Create a `proxy.config.ts` in the `packages/proxy` directory
1. `npm run i`
1. `npm run build`
1. `npm run start:dev -w packages/proxy`
    - Note: Malcom should not be run with turbo due to STDIO issues where an input prompt is not provided within the execution content

❤️ Made with Love by @nickhudkins
