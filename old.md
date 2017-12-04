# krakn graph database client - krakn-js

- Node.js client using krakn's http interface
- this client is thin wrapper around async http requests
- you can find the full curl doc [here](https://github.com/krakndb/krakn/blob/master/docs/curl.md).
- install via `npm install krakn-js`

```javascript
"use strict";
const {KraknClient} = require("krakn-js");

const krakn = new KraknClient({
    proto: "http",
    host: "localhost",
    port: 3058
});

(async () => {
    const edge = await krakn.getEdge(1, 2, "likes");
    //..
})();
```