# yildiz graph database client - yildiz-js

- Node.js client using yildiz's http interface
- this client is thin wrapper around async http requests
- you can find the full curl doc [here](https://github.com/yildizdb/yildiz/blob/master/docs/curl.md).
- install via `npm install yildiz-js`
- use `DEBUG=yildiz:*` to get debug logs

```javascript
"use strict";
const {YildizClient} = require("yildiz-js");

const yildiz = new YildizClient({
    prefix: "mydb",
    proto: "http",
    host: "localhost",
    port: 3058,
    token: "bla-bla-bla-bla" //optional
});

(async () => {

    const leftNode = "Simone";
    const rightNode = "Holger";

    //store hash translation of node string representations
    const translatedLeftNode = await yildiz.storeTranslation(leftNode, {}, false);
    const translatedRightNode = await yildiz.storeTranslation(rightNode, {}, false);
    //translatedLeftNode.identifier === murmurhash3(leftNode)

    //create 2 nodes
    const storedLeftNode = await yildiz.createNode(translatedLeftNode.identifier, {}, ttld = false, {});
    const storedRightNode = await yildiz.createNode(rightNode, {}, ttld = false, {}); //passing strings will translate them (but not translation will be stored!)

    //create an edge between nodes
    const relation = "loves";
    const createResult = await yildiz.createEdge(storedLeftNode.id, storedRightNode.id, relation, {}, ttld = false, {});

    if(!createResult.success){
        return console.error("Failed to create edge.");
    }

    const edge = await yildiz.getEdge(storedLeftNode.id, storedRightNode.id, relation);
    console.log(edge);

    //getAllEdgesFromLeft, getAllEdgesFromRight, getAllEdgesForLeftOrRight

    const increaseResult = await yildiz.increaseEdgeDepth(storedLeftNode.id, storedRightNode.id, relation);
    const deleteResult = await yildiz.deleteEdge(storedLeftNode.id, storedRightNode.id, relation);

    //the relation creation above can be done faster via relation upserting:
    const resultIds = await yildiz.upsertRelation(leftNode, rightNode);
})();
```