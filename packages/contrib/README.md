# 👴🏻 Malcolm (in the Middle) - Contrib

Fun little utilities for Malcolm

### Usage

In your `proxy.config.ts`:

```typescript
import { defineConfig } from "@nickhudkins/malcolm";
import { withoutCSP } from "@nickhudkins/malcolm-contrib";

export default defineConfig({
  hosts: ["google.com"],
  handleResponse: (res: PassThroughResponse) => {
    // Using `withoutCSP`, if your CSP is in a http-equiv
    // tag, you must pass `removeHttpEquiv`. This is a simple
    // optimization to prevent unnecessary parsing of the response
    // body if we only need to strip a header.
    return withoutCSP(res, { removeHttpEquiv: true });
  },
});
```
