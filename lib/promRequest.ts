import { Agent } from "http";
import Debug from "debug";
import request, { Response, CoreOptions, UrlOptions } from "request";
import { GenericObject } from "./interface/Generic";

const debug = Debug("yildiz:http:pr");

export interface ResponseData extends GenericObject {
    time: null | GenericObject;
}

const reqProm = (
    prefix: string,
    token: string | undefined,
    proto: string,
    host: string,
    port: string | number,
    path: string = "/",
    options: GenericObject = {},
    agent?: Agent,
    timings: boolean = false,
    expectedStatusCode?: string | number) => {

    options.url = `${proto}://${host}:${port}${path}`;

    if (!options) {
        options = {};
    }

    if (!options.headers) {
        options.headers = {};
    }

    options.headers["content-type"] = "application/json";
    options.headers["x-yildiz-prefix"] = prefix;

    if (token) {
        options.headers.authorization = token;
    }

    if (options.body && typeof options.body !== "string") {
        options.body = JSON.stringify(options.body);
    }

    // keep-alive
    if (agent) {
        options.agent = agent;
    }

    if (timings) {
        options.time = true;
    }

    return new Promise((resolve, reject) => {
        request(options as (UrlOptions & CoreOptions), (error: Error, response: Response, body: Response["body"]) => {

            if (error) {
                return reject(error);
            }

            debug("dispatched:", `${options.method || "GET"} -> ${options.url}`, "returned as:", response.statusCode);

            let parsedBody = null;
            try {
                parsedBody = JSON.parse(body);
            } catch (error) {
                // empty
            }

            const responseData: ResponseData = {
                time: null,
            };

            if (timings) {
                responseData.time = {
                    elapsedTime: response.elapsedTime,
                    timingStart: response.timingStart,
                    timings: response.timings,
                    timingPhases: response.timingPhases,
                };
            }

            if (expectedStatusCode && response.statusCode !== expectedStatusCode) {

                let errorMessage = "No error message present in body";
                if (parsedBody && parsedBody.error) {
                    errorMessage = parsedBody.error;
                } else if (response.statusCode === 500) {
                    errorMessage = body;
                }

                return reject(new Error(`Response status code: ${response.statusCode} ` +
                    `does not match expected status code: ${expectedStatusCode}. ${errorMessage}.`));
            }

            resolve(Object.assign(responseData, {
                status: response.statusCode,
                headers: response.headers,
                body: parsedBody,
            }));
        });
    });
};

const getInstance = (
    prefix: string,
    token?: string,
    proto: string = "http",
    host: string = "localhost",
    port: number | string = 3058,
    agent?: Agent,
    timings: boolean = false) => {

        return (path: string, options: GenericObject, expectedStatusCode?: number | string) => {

            return reqProm(
                prefix,
                token,
                proto,
                host,
                port,
                path,
                options,
                agent,
                timings,
                expectedStatusCode,
            );
        };
};

export {
    getInstance,
};
