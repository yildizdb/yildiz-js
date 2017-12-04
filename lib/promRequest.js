"use strict";

const Promise = require("bluebird");
const request = require("request");
const debug = require("debug")("yildiz:http:pr");

const reqProm = (prefix, proto, host, port, path = "/", options = {}, expectedStatusCode = null) => {
    
    options.url = `${proto}://${host}:${port}${path}`;

    if(!options){
        options = {};
    }

    if (!options.headers) {
        options.headers = {};
    }

    options.headers["content-type"] = "application/json";
    options.headers["x-yildiz-prefix"] = prefix;

    if(options.body && typeof options.body !== "string"){
        options.body = JSON.stringify(options.body);
    }

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {

            if (error) {
                return reject(error);
            }

            debug("dispatched:", `${options.method || "GET"} -> ${options.url}`, "returned as:", response.statusCode);

            try {
                body = JSON.parse(body);
            } catch (error) {
                //empty
            }

            if(expectedStatusCode && response.statusCode !== expectedStatusCode){
                return reject(new Error(`Response status code: ${response.statusCode} does match expected status code: ${expectedStatusCode}.`));
            }

            resolve({
                status: response.statusCode,
                headers: response.headers,
                body
            });
        });
    });
};

module.exports = {
    getInstance: (prefix, proto = "http", host = "localhost", port = 3058) => {
        return (path, options, expectedStatusCode) => {
            return reqProm(prefix, proto, host, port, path, options, expectedStatusCode);
        };
    }
};