"use strict";

const debug = require("debug")("krakn:http");
const {getInstance} = require("./promRequest.js");

const DEFAULT_PREFIX = "default";

class HttpClient {
    
    constructor(config = {}){

        let {
            prefix,
            proto,
            host,
            port
        } = config;

        prefix = prefix || DEFAULT_PREFIX;

        this._req = getInstance(prefix, proto, host, port);
        debug(`${proto}://${host}:${port} via prefix = ${prefix}.`);
    }

    raw(path, options, expectedStatusCode){
        return this._req(path, options, expectedStatusCode);
    }

    async getServerVersion(){
        const {body} = await this.raw("/", {}, 200);
        const {version} = body;
        return version;
    }

    async isAlive(){
        await this.raw("/admin/healthcheck", {}, 200);
    }

    async getHealth(){
        const {body} = await this.raw("/admin/health", {}, 200);
        return body;
    }

    async getStats(){
        const {body} = await this.raw("/admin/stats", {}, 200);
        return body;
    }

    async getMetrics(){
        const {body} = await this.raw("/admin/metrics", {}, 200);
        return body;
    }

    /* TRANSLATIONS */

    async storeTranslation(_body = {}){
        const {body} = await this.raw("/translator/translate-and-store", {
            method: "POST",
            body: _body
        }, 201);
        return body;
    }

    async getTranslation(identifier){
        const {status, body} = await this.raw(`/translator/${identifier}`, {});
        switch(status){
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    async deleteTranslation(identifier){

        const {status, body} = await this.raw(`/translator/${identifier}`, {
            method: "DELETE"
        });

        switch(status){
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    /* NODES */

    async createNode(_body = {}){
        const {body} = await this.raw("/node", {
            method: "POST",
            body: _body
        }, 201);
        return body;
    }

    async getNode(identifier){
        const {status, body} = await this.raw(`/node/${identifier}`, {});
        switch(status){
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    async deleteNode(identifier){

        const {status, body} = await this.raw(`/node/${identifier}`, {
            method: "DELETE"
        });

        switch(status){
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    /* EDGES */

    async createEdge(_body = {}){
        const {body} = await this.raw("/edge", {
            method: "POST",
            body: _body
        }, 201);
        return body;
    }

    async getEdge(leftId, rightId, relation){

        const {status, body} = await this.raw(`/edge/${leftId}/${rightId}/${relation}`);

        switch(status){
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    async increaseEdgeDepth(_body = {}){
        
        const {body} = await this.raw("/edge/depth/increase", {
            method: "PUT",
            body: _body
        }, 200);

        return body;
    }

    async decreaseEdgeDepth(_body = {}){

        const {body} = await this.raw("/edge/depth/decrease", {
            method: "PUT",
            body: _body
        }, 200);

        return body;
    }

    async deleteEdge(leftId, rightId, relation){
        
        const {status, body} = await this.raw(`/edge/${leftId}/${rightId}/${relation}`, {
            method: "DELETE"
        });

        switch(status){
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    /* ACCESS */

    async getTranslatedEdgeInfoForNodes(values = []){
        const {body} = await this.raw("/access/translated-edge-info", {
            method: "POST",
            body: {
                values
            }
        }, 200);
        return body;
    }

    /* RAW */

    async runRawQuery(query, replacements){
        const {body} = await this.raw("/raw/query", {
            method: "POST",
            body: {
                query,
                replacements
            }
        }, 200);
        return body; //results
    }

    async runRawSpread(query, replacements){
        const {body} = await this.raw("/raw/spread", {
            method: "POST",
            body: {
                query,
                replacements
            }
        }, 200);
        return body; //metadata
    }

    /* PATH */

    async getShortestPath(start, end){
        const {body} = await this.raw("/path/shortest-path", {
            method: "POST",
            body: {
                start,
                end
            }
        }, 200);
        return body;
    }
}

module.exports = HttpClient;
