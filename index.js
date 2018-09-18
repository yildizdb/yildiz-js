"use strict";

const { HttpClient } = require("./build/HttpClient.js");

module.exports = {
    default: HttpClient,
    HttpClient,
    YildizClient: HttpClient
};