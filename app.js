var fs = require('fs');
var regexp = require('node-regexp');
var express = require('express');
var bodyParser =  require("body-parser");
var http = require('http');
var util  = require('util');
var spawn = require('child_process').spawn;

var app=express();
var re = regexp().end('.mp4').toRegExp();
var map={},map1={},map3={};
var co=0;
var has_conn=0;
var search_req=0;
var map={};
var cur_mov_str;

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
	res.send('ok');
});

app.get('/downloads',function(req,res){
	var response='';
	var data=fs.readFileSync('shared','utf8');
	data=data.split(';');
	var id=0;

	for(var i=0;i<data.length;i++)
	{
		console.log(data[i]);
		var files=fs.readdirSync(data[i]);
			 
		var directory=data[i];
		for(var j in files)
		{		 
			var file=files[j];
			if(re.test(file))
			{
				response +=  file +'\n' ;

				map[id]=directory;
				map1[id]= file;	
				id+=1
			}
		}
	}
	if(id==0){
		console.log("Please share some files\n");
		process.exit(code=0);
	}
	console.log(response);
	res.send(response);
});

app.get('/downloads/*', function (req, res) {
	var id='';
	for(var i=11;i<req.url.length;i++)	id+=req.url[i];
	console.log(id);
	var path = map[id] + '/' + map1[id];
	console.log(path);
	var stat = fs.statSync(path);
	var total = stat.size;
	if (req.headers['range']) {
		var range = req.headers.range;
		var parts = range.replace(/bytes=/, "").split("-");
		var partialstart = parts[0];
		var partialend = parts[1];

		var start = parseInt(partialstart, 10);
		var end = partialend ? parseInt(partialend, 10) : total-1;
		var chunksize = (end-start)+1;
		console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

		var file = fs.createReadStream(path, {start: start, end: end});
		res.writeHead(206, { 'Content-Range': 'bytes ' + start + 
			'-' + end + '/' + total, 'Accept-Ranges': 'bytes', 
			'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
		file.pipe(res);
	} else {
		console.log('ALL: ' + total);
		res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
		fs.createReadStream(path).pipe(res);
	}
});

app.get('/readjquery',function(req,res){
	fs.readFile('jquery.min.js', 'utf8', function (err,data) {
  		if (err) {
			console.log(err);
  		}
  		res.send(data);
	});
});

app.listen(3000);