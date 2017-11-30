"use strict";

const HttpClient = require("./lib/HttpClient.js");

module.exports = {
    default: HttpClient,
    HttpClient,
    KraknClient: HttpClient
};