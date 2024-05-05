# 👴🏻 Malcolm (in the Middle)

It's Man-In-The-Middle-Proxy for Development

### Usage

Create a `proxy.config.ts`:

```typescript
export default {
  shouldProxy(origin) {
    return origin.includes("google.com");
  },
  handleRequest(req): void {
    const url = new URL(req.url);
    const logMsg = `[👴🏻 Malcolm] - I'll Handle This (${url.host})`;
    console.log(logMsg);
  },
  async handleResponse(
    res: PassThroughResponse
  ): Promise<CallbackResponseResult | undefined> {
    if (res.headers["content-type"]?.startsWith("text/html")) {
      return {
        body: Buffer.from(`Hi from Malcolm!`),
      };
    }
    return;
  },
};
```

Run `malcolm`

### Development

Working in this directory?Clone and `npm run start:dev`

❤️ Made with Love by @nickhudkins
