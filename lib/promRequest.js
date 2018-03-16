"use strict";

const Promise = require("bluebird");
const request = require("request");
const debug = require("debug")("yildiz:http:pr");

const reqProm = (prefix, token, proto, host, port, path = "/", options = {}, agent = undefined, timings = false, expectedStatusCode = null) => {
    
    options.url = `${proto}://${host}:${port}${path}`;

    if(!options){
        options = {};
    }

    if (!options.headers) {
        options.headers = {};
    }

    options.headers["content-type"] = "application/json";
    options.headers["x-yildiz-prefix"] = prefix;

    if(token){
        options.headers["authorization"] = token;
    }

    if(options.body && typeof options.body !== "string"){
        options.body = JSON.stringify(options.body);
    }

    //keep-alive
    if(agent){
        options.agent = agent;
    }

    if(timings){
        options.time = true;
    }

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {

            if (error) {
                return reject(error);
            }

            debug("dispatched:", `${options.method || "GET"} -> ${options.url}`, "returned as:", response.statusCode);

            let parsedBody = null;
            try {
                parsedBody = JSON.parse(body);
            } catch (error) {
                //empty
            }

            const responseData = {
                time: null
            };

            if(timings){
                responseData.time = {
                    elapsedTime: response.elapsedTime,
                    responseStartTime: response.responseStartTime,
                    timingStart: response.timingStart,
                    timings: response.timings,
                    timingPhases: response.timingPhases
                };
            }

            if(expectedStatusCode && response.statusCode !== expectedStatusCode){

                let errorMessage = "No error message present in body";
                if(parsedBody && parsedBody.error){
                    errorMessage = parsedBody.error;
                } else if(response.statusCode === 500) {
                    errorMessage = body;
                }

                return reject(new Error(`Response status code: ${response.statusCode} does match expected status code: ${expectedStatusCode}. ${errorMessage}.`));
            }

            resolve(Object.assign(responseData, {
                status: response.statusCode,
                headers: response.headers,
                body: parsedBody
            }));
        });
    });
};

module.exports = {
    getInstance: (prefix, token, proto = "http", host = "localhost", port = 3058, agent = undefined, timings = false) => {
        return (path, options, expectedStatusCode) => {
            return reqProm(prefix, token, proto, host, port, path, options, agent, timings, expectedStatusCode);
        };
    }
};