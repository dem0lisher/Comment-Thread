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

// server.get('/data', function(req, res){
// 	var db = router.db
// 	var posts = db.get('posts')
// 	var comments = db.get('comments')
// 	res.jsonp({posts: posts, comments: comments});
// })

server.post('/update-vote', function(req, res){
	var db = router.db
	var posts = db.get('posts')
	res.jsonp(posts)
})

server.use(router);
server.listen(3000, () => {
	console.log('JSON server is running');
});