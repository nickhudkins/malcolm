# 👴🏻 Malcolm (in the Middle)

It's Man-In-The-Middle-Proxy for Development

### Usage

Create a `proxy.config.ts`:

```typescript

import { defineConfig } from "@nickhudkins/malcolm";

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
};
```

Run `malcolm`

### Development

Working in this directory?Clone and `npm run start:dev`

❤️ Made with Love by @nickhudkins
