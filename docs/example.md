# Example

Below is a small example of how to create and use a YildizClient instance.

```javascript
"use strict";
const {YildizClient} = require("yildiz-js");

const yildiz = new YildizClient({
    prefix: "mydb",
    proto: "http",
    host: "localhost",
    port: 3058,
    token: "bla-bla-bla-bla", //optional
    disableKeepAlive: false, //optional - disable keep alive pool
    enableTimings: false //optional - adds time object to response of yildiz.raw()
    timeoutMs: 7500 //optional - timeout in milliseconds for the request
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

    yildiz.close();
})();
```