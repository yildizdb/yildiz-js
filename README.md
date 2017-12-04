# yildiz graph database client - yildiz-js

- Node.js client using yildiz's http interface
- this client is thin wrapper around async http requests
- you can find the full curl doc [here](https://github.com/yildizdb/yildiz/blob/master/docs/curl.md).
- install via `npm install yildiz-js`

```javascript
"use strict";
const {YildizClient} = require("yildiz-js");

const yildiz = new YildizClient({
    proto: "http",
    host: "localhost",
    port: 3058
});

(async () => {
    const edge = await yildiz.getEdge(1, 2, "likes");
    //..
})();
```