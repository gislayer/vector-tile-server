
const path = require('path');
const fs = require('fs');
const sql = require('./database/API-sql');
const axios = require('axios');
sql.defineModels()

const express = require('express');

const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./API-routes');
const app = express();
const port = 1881;

//const ws = require('./socket');
app.set('layers', path.join(__dirname, 'data'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(cors())
app.use(function(req, res, next) {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Credentials', true);
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
res.header('Access-Control-Allow-Methods', 'GET, POST');
next();
});
app.use('/', routes);

let reqPath = path.join(__dirname, '../');
var lang = fs.readFileSync(reqPath+'/lang/default.json',{encoding:'utf8', flag:'r'});
lang=JSON.parse(lang);

app.locals.tiles = {};
app.locals.sql = sql;
app.locals.lang = lang;
app.locals.emptytile = null;
//app.locals.ws = ws;
app.use(cookieParser());

var emptytile = fs.readFileSync(__dirname+'/database/emptytile.png', 'binary');
app.locals.emptytile = new Buffer(emptytile, 'binary');

//api.locals.GL = GL;
const server = app.listen(port, () => {
  app.locals.status = true;
  console.log(`Express server listening on port ${port}`)
});

app.get('/close', function(req, res, next) {
  console.log("Server Kapatılıyor");
  res.send('Server Closed!');
  setTimeout(function () {
    server.close();
    next();
  }, 10)
});

app.get('/changelanguage',function(req, res, next){
  let reqPath = path.join(__dirname, '../');
  var lang = fs.readFileSync(reqPath+'/lang/default.json',{encoding:'utf8', flag:'r'});
  lang=JSON.parse(lang);
  app.locals.lang = lang;
  res.send({status:true});
  next();
});