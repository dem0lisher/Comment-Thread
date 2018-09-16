var express = require('express');
var app = express();
app.use("/", express.static(__dirname));
app.listen(process.env.PORT || 8081);
console.log("Server listening on port 8081");

var jsonServer = require('json-server');
var server =  jsonServer.create();
var router = jsonServer.router('./db/data.json');
var middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(router);
server.listen(3000, () => {
	console.log('JSON server is running');
});