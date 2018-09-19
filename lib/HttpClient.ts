import Debug from "debug";
import http from "http";

import { getInstance } from "./promRequest";
import { GenericObject } from "./interface/Generic";

const debug = Debug("yildiz:http");
const DEFAULT_PREFIX = "default";

export interface Config {
    prefix?: string;
    proto?: string;
    host?: string;
    port?: string | number;
    token?: string;
    disableKeepAlive: boolean;
    enableTimings: boolean;
    timeoutMs: number;
}

export class HttpClient {

    private agent: http.Agent | undefined;
    private timeoutMs: number;
    private req: any;

    constructor(config: Config) {

        const {
            prefix = DEFAULT_PREFIX,
            proto,
            host,
            port,
            token,
            disableKeepAlive,
            enableTimings,
            timeoutMs,
        } = config;

        this.agent = undefined;

        if (disableKeepAlive !== true) {
            this.agent = new http.Agent({
                keepAlive: true,
                keepAliveMsecs: 3000,
                maxSockets: 200,
                maxFreeSockets: 150,
            });
        }

        this.timeoutMs = timeoutMs || 7500;

        this.req = getInstance(prefix, token, proto, host, port, this.agent, enableTimings);
        debug(`${proto}://${host}:${port} via prefix = ${prefix}.`);
    }

    public raw(path: string, options: GenericObject, expectedStatusCode?: number | string) {

        if (options && typeof options === "object" && !options.timeout) {
            options.timeout = this.timeoutMs;
        }

        return this.req(path, options, expectedStatusCode);
    }

    public async getServerVersion() {
        const {body} = await this.raw("/", {}, 200);
        const {version} = body;
        return version;
    }

    public async isAlive() {
        await this.raw("/admin/healthcheck", {}, 200);
    }

    public async getHealth() {
        const {body} = await this.raw("/admin/health", {}, 200);
        return body;
    }

    public async getStats() {
        const {body} = await this.raw("/admin/stats", {}, 200);
        return body;
    }

    public async getMetrics() {
        const {body} = await this.raw("/admin/metrics", {}, 200);
        return body;
    }

    public async checkAuth() {
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
    public async storeTranslation(value: string | number, data = {}, ttld = false) {
        const {body} = await this.raw("/translator/translate-and-store", {
            method: "POST",
            body: {
                value,
                data,
                ttld,
            },
        }, 201);
        return body;
    }

    public async getTranslation(identifier: string | number) {
        const {status, body} = await this.raw(`/translator/${identifier}`, {});
        switch (status) {
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    public async deleteTranslation(identifier: string | number) {

        const {status, body} = await this.raw(`/translator/${identifier}`, {
            method: "DELETE",
        });

        switch (status) {
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
     * @param {object} extend - can be used to set custom extended database columns
     * @returns {Promise.<Node>} - a promise that resolves into the created node object
     */
    public async createNode(identifier: string | number, data = {}, ttld = false, extend: any = {}) {
        const {body} = await this.raw("/node", {
            method: "POST",
            body: {
                identifier,
                data,
                ttld,
                extend,
            },
        }, 201);
        return body;
    }

    public async getNode(identifier: string | number) {
        const {status, body} = await this.raw(`/node/${identifier}`, {});
        switch (status) {
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    public async deleteNode(identifier: string | number) {

        const {status, body} = await this.raw(`/node/${identifier}`, {
            method: "DELETE",
        });

        switch (status) {
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
     * @param {object} extend - can be used to set custom extended database column
     * @returns {Promise.<{success}>} - a promise that resolves into an object with a field called success (boolean value)
     */
    public async createEdge(leftId: string | number, rightId: string | number, relation = "1", attributes = {}, ttld = false, extend = {}) {
        const {body} = await this.raw("/edge", {
            method: "POST",
            body: {
                leftId,
                rightId,
                relation,
                attributes,
                ttld,
                extend,
            },
        }, 201);
        return body;
    }

    public async getEdge(leftId: string | number, rightId: string | number, relation: string | number) {

        const {status, body} = await this.raw(`/edge/${leftId}/${rightId}/${relation}`, {});

        switch (status) {
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    public async increaseEdgeDepth(leftId: string | number, rightId: string | number, relation = "1") {
        const {body} = await this.raw("/edge/depth/increase", {
            method: "PUT",
            body: {
                leftId,
                rightId,
                relation,
            },
        }, 200);

        return body;
    }

    public async decreaseEdgeDepth(leftId: string | number, rightId: string | number, relation = "1") {
        const {body} = await this.raw("/edge/depth/decrease", {
            method: "PUT",
            body: {
                leftId,
                rightId,
                relation,
            },
        }, 200);

        return body;
    }

    public async deleteEdge(leftId: string | number, rightId: string | number, relation: string | number) {
        const {status, body} = await this.raw(`/edge/${leftId}/${rightId}/${relation}`, {
            method: "DELETE",
        });

        switch (status) {
            case 200: return body;
            case 404: return null;
            default: throw new Error(`Unexpected status code: ${status}.`);
        }
    }

    public async getAllEdgesFromLeft(leftId: string | number, relation: string | number) {
        const {body} = await this.raw(`/edge/left/${leftId}/${relation}`, {}, 200);
        return body;
    }

    public async getAllEdgesFromRight(rightId: string | number, relation: string | number) {
        const {body} = await this.raw(`/edge/right/${rightId}/${relation}`, {}, 200);
        return body;
    }

    public async getAllEdgesForLeftOrRight(id: string | number, relation: string | number) {
        const {body} = await this.raw(`/edge/both/${id}/${relation}`, {}, 200);
        return body;
    }

    /* ACCESS */

    public async getTranslatedEdgeInfoForNodes(values = []) {
        const {body} = await this.raw("/access/translated-edge-info", {
            method: "POST",
            body: {
                values,
            },
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
     * @param {boolean} isPopularRightNode - if the right node is used extensively
     * @param {number} edgeTime - time of the event that caused this edge in unix epoch milliseconds
     * @returns {Promise.<{object}>} - result contains the created/selected ids and identifiers
     */

    public async upsertRelation(
        leftNodeIdentifierVal: string | number,
        rightNodeIdentifierVal: string | number,
        leftNodeData: any = {},
        rightNodeData: any = {},
        ttld: boolean = false,
        relation: string | number = "1",
        edgeData: any = {},
        depthBeforeCreation: boolean = true,
        isPopularRightNode: boolean = false,
        edgeTime?: string | number) {

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
                depthBeforeCreation,
                isPopularRightNode,
                edgeTime: edgeTime || Date.now(),
            },
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
     * @param {boolean} isPopularRightNode - if the right node is used extensively
     * @param {number} edgeTime - time of the event that caused this edge in unix epoch milliseconds
     * @returns {Promise.<{object}>} - result contains the created/selected ids and identifiers
     */
    public async upsertRelationNoTransaction(
        leftNodeIdentifierVal: string | number,
        rightNodeIdentifierVal: string | number,
        leftNodeData: any = {},
        rightNodeData: any = {},
        ttld: boolean = false,
        relation: string | number = "1",
        edgeData: any = {},
        depthBeforeCreation: boolean = true,
        isPopularRightNode: boolean = false,
        edgeTime?: string | number) {

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
                depthBeforeCreation,
                isPopularRightNode,
                edgeTime: edgeTime || Date.now(),
            },
        }, 200);

        return body;
    }

    /* RAW */

    public async runRawQuery(query: string, replacements: string) {
        const {body} = await this.raw("/raw/query", {
            method: "POST",
            body: {
                query,
                replacements,
            },
        }, 200);
        return body; // results
    }

    public async runRawSpread(query: string, replacements: string) {
        const {body} = await this.raw("/raw/spread", {
            method: "POST",
            body: {
                query,
                replacements,
            },
        }, 200);
        return body; // metadata
    }

    /* PATH */

    public async getShortestPath(start: string | number, end: string | number) {
        const {body} = await this.raw("/path/shortest-path", {
            method: "POST",
            body: {
                start,
                end,
            },
        }, 200);
        return body;
    }

    public close() {

        if (this.agent) {
            this.agent.destroy();
            this.agent = undefined;
        }
    }
}
