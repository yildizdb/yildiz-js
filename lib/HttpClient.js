"use strict";

const debug = require("debug")("yildiz:http");
const {getInstance} = require("./promRequest.js");

const DEFAULT_PREFIX = "default";

class HttpClient {
    
    constructor(config = {}){

        let {
            prefix,
            proto,
            host,
            port,
            token
        } = config;

        prefix = prefix || DEFAULT_PREFIX;

        this._req = getInstance(prefix, token, proto, host, port);
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

    async checkAuth(){
        const {status} = await this.raw("/admin/authcheck", {}, 200);
        return status;
    }

    /* TRANSLATIONS */

    /**
     * translates and stores a new value
     * @param {string} value - value that will be translated 
     * @param {object} data  - optional data object
     * @param {boolean} ttld  - if this value should be deleted after ttl, defaults to false
     * @returns {Promise.<Translation>} - a promise that resolves into the created translation object
     */
    async storeTranslation(value, data = {}, ttld = false){
        const {body} = await this.raw("/translator/translate-and-store", {
            method: "POST",
            body: {
                value,
                data,
                ttld
            }
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

    /**
     *  creates a new graph node
     * @param {number|string} identifier - hash identifier (if a string is passed, it will be converted automatically)
     * @param {object} data - optional data object
     * @param {boolean} ttld - if this value should be deleted after ttl, defaults to false
     * @param {object} _extend - can be used to set custom extended database columns
     * @returns {Promise.<Node>} - a promise that resolves into the created node object
     */
    async createNode(identifier, data = {}, ttld = false, _extend = {}){
        const {body} = await this.raw("/node", {
            method: "POST",
            body: {
                identifier,
                data,
                ttld,
                _extend
            }
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

    /**
     *  creates a new graph edge
     * @param {number} leftId - yildiz id of left node (not its identifier!)
     * @param {number} rightId - yildiz id of right node (not its identifier!)
     * @param {string} relation - optional relation description
     * @param {object} data - optional data object
     * @param {boolean} ttld - if this value should be deleted after ttl, defaults to false
     * @param {object} _extend - can be used to set custom extended database column
     * @returns {Promise.<{success}>} - a promise that resolves into an object with a field called success (boolean value)
     */
    async createEdge(leftId, rightId, relation = "1", attributes = {}, ttld = false, _extend = {}){
        const {body} = await this.raw("/edge", {
            method: "POST",
            body: {
                leftId,
                rightId,
                relation,
                attributes,
                ttld,
                _extend
            }
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

    async increaseEdgeDepth(leftId, rightId, relation = "1"){
        const {body} = await this.raw("/edge/depth/increase", {
            method: "PUT",
            body: {
                leftId,
                rightId,
                relation
            }
        }, 200);

        return body;
    }

    async decreaseEdgeDepth(leftId, rightId, relation = "1"){
        const {body} = await this.raw("/edge/depth/decrease", {
            method: "PUT",
            body: {
                leftId,
                rightId,
                relation
            }
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

    async getAllEdgesFromLeft(leftId, relation){
        const {body} = await this.raw(`/edge/left/${leftId}/${relation}`, {}, 200);
        return body;
    }

    async getAllEdgesFromRight(rightId, relation){
        const {body} = await this.raw(`/edge/right/${rightId}/${relation}`, {}, 200);
        return body;
    }

    async getAllEdgesForLeftOrRight(id, relation){
        const {body} = await this.raw(`/edge/both/${id}/${relation}`, {}, 200);
        return body;
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

    /**
     * pass in values for nodes
     * to create 2 nodes if they didnt exist
     * 2 translations if they didnt exist
     * 1 edge between the two nodes (or alt. increased depth in existing edge)
     * uses a db transaction
     * @param {string} leftNodeIdentifierVal - value of the left node, will be turned into identifier
     * @param {string} rightNodeIdentifierVal - value of the right node, will be turned into identifier
     * @param {object} leftNodeData - additional data for the left node
     * @param {object} rightNodeData - additional data for the right node
     * @param {boolean} ttld - ttl flag will be set for all resources, default is false
     * @param {string} relation - relation of the edge
     * @param {object} edgeData - additional data for the edge
     * @param {boolean} depthBeforeCreation - if true will always create a new edge, if false will increase depth (dont mix!)
     * @returns {Promise.<{object}>} - result contains the created/selected ids and identifiers
     */
    async upsertRelation(leftNodeIdentifierVal, rightNodeIdentifierVal, leftNodeData = {}, rightNodeData = {}, ttld = false,
        relation = "1", edgeData = {}, depthBeforeCreation = true){

        const {body} = await this.raw("/access/upsert-singular-relation", {
            method: "POST",
            body: {
                leftNodeIdentifierVal, 
                rightNodeIdentifierVal, 
                leftNodeData, 
                rightNodeData,
                ttld, 
                relation, 
                edgeData,
                depthBeforeCreation
            }
        }, 200);

        return body;
    }

    /**
     * pass in values for nodes
     * to create 2 nodes if they didnt exist
     * 2 translations if they didnt exist
     * 1 edge between the two nodes (or alt. increased depth in existing edge)
     * uses no db transaction
     * @param {string} leftNodeIdentifierVal - value of the left node, will be turned into identifier
     * @param {string} rightNodeIdentifierVal - value of the right node, will be turned into identifier
     * @param {object} leftNodeData - additional data for the left node
     * @param {object} rightNodeData - additional data for the right node
     * @param {boolean} ttld - ttl flag will be set for all resources, default is false
     * @param {string} relation - relation of the edge
     * @param {object} edgeData - additional data for the edge
     * @param {boolean} depthBeforeCreation - if true will always create a new edge, if false will increase depth (dont mix!)
     * @returns {Promise.<{object}>} - result contains the created/selected ids and identifiers
     */
    async upsertRelationNoTransaction(leftNodeIdentifierVal, rightNodeIdentifierVal, leftNodeData = {}, rightNodeData = {}, ttld = false,
        relation = "1", edgeData = {}, depthBeforeCreation = true){

        const {body} = await this.raw("/access/upsert-singular-relation-no-transaction", {
            method: "POST",
            body: {
                leftNodeIdentifierVal, 
                rightNodeIdentifierVal, 
                leftNodeData, 
                rightNodeData,
                ttld, 
                relation, 
                edgeData,
                depthBeforeCreation
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
