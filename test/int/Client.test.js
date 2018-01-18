"use strict";

const assert = require("assert");
const express = require("express");
const bodyParser = require("body-parser");

const {HttpClient} = require("./../../index.js");

describe("Client INT", () => {

    let server = null;
    let port = 3059;

    const client = new HttpClient({
        proto: "http",
        host: "localhost",
        port
    });

    before(done => {
        const app = express();

        app.use(bodyParser.json());

        app.get("/test", (req, res) => {
            assert.equal(req.headers.connection, "keep-alive");
            res.status(202);
            res.set("hi", "ho");
            res.end();
        });

        app.post("/test-again", (req, res) => {
            assert.equal(req.headers.connection, "keep-alive");
            res.json(req.body);
        });

        app.get("/badcode", (req, res) => {
            res.status(400);
            res.end();
        });

        server = app.listen(port, done);
    });

    after(done => {
        client.close();
        server.close(done);
    });

    it("should be able to make get request", async() => {
        const {status, headers} = await client.raw("/test", {});
        assert.equal(status, 202);
        assert.equal(headers.hi, "ho");
    });

    it("should be able to make post request", async() => {
        
        const {status, body} = await client.raw("/test-again", {
            method: "POST",
            body: {
                bla: "blup"
            }
        });

        assert.equal(status, 200);
        assert.ok(body);
        assert.equal(body.bla, "blup");
    });

    it("should be able to receive error on bad status code", async() => {
        
        let errorThrown = false;

        try {
            await client.raw("/badcode", {}, 200);
        } catch(error){
            errorThrown = true;
            assert.equal(error.message, "Response status code: 400 does match expected status code: 200. No error message present in body.");
        }
    
        assert.ok(errorThrown);
    });
});