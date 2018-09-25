<h1 align="center">Yildiz Graph Database Node.js Client</h1>
<p align="center">
  <img alt="yildiz" src="docs/images/YildizDBLogo.png" width="362">
</p>
<p align="center">
  Thin graph database layer on top of Google Bigtable.
</p>

[![Version][version-badge]][package] [![MIT License][license-badge]][license] ![node][node-badge] [![Swagger][swagger-badge]][swagger-url]

# Infos

* Node.js client using YildizDB's HTTP interface
* This client is a thin wrapper around async HTTP requests
* HTTP API Description: [Open API][swagger-url]
* Install via `npm install yildiz-js`
* Use `DEBUG=yildiz:*` to get debug logs
* More details on YildizDB can be found [here](https://github.com/yildizdb/yildiz)
* Sample on how to use this client is [here](docs/example.md)

<!-- badges -->
[version-badge]: https://badge.fury.io/js/yildiz-js.svg
[package]: https://www.npmjs.com/package/yildiz-js
[license-badge]: https://img.shields.io/npm/l/yildiz-js.svg
[license]: https://opensource.org/licenses/MIT
[swagger-url]: https://petstore.swagger.io/?url=https://raw.githubusercontent.com/yildizdb/yildiz/master/docs/swagger.yml
[node-badge]: https://img.shields.io/node/v/yildiz-js.svg
[swagger-badge]: https://img.shields.io/badge/Swagger%20UI-OK-orange.svg