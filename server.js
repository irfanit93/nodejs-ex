//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var path=require('path');
app.use(express.static(path.join(__dirname+'/reactposts')));
var bodyParser=require('body-parser');
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";
var getuser={posts:[
{id:"user0",name:"ahamed irfan",description:"CSS is a Styling language used to design webpages",postedtime:new Date().toLocaleTimeString()},
{id:"user1",name:"wasim akram",description:"CSS is used to add styles to webpages externally or through style tag or by inlining styles",postedtime:new Date().toLocaleTimeString()},
{id:"user2",name:"earshath khan",description:"CSS is used along with HTML for designing the webpage ",postedtime:new Date().toLocaleTimeString()},
{id:"user3",name:"ahamedirfan",description:"CSS is used to perform liquid animations ",postedtime:new Date().toLocaleTimeString()}
]};
app.use(bodyParser.urlencoded({extended:false}));
app.get("/getuser",function(req,res){
console.log("request received");
res.send(getuser.posts);
});
app.post("/postcomment",function(req,res){
console.log(typeof req.body.post);
console.log(req.body);
getuser.posts.push(JSON.parse(req.body.post));
console.log(typeof getuser.posts);
res.send(getuser.posts);
});
app.post("/updatecomment",function(req,res){
console.log(typeof req.body.updatedposts);
console.log("updatecomment"+getuser.posts);
console.log("updatedposts"+req.body.updatedposts);
getuser.posts=[];
getuser.posts=JSON.parse(req.body.updatedposts).updatedposts;
res.send(getuser.posts);
});

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    //var col = db.collection('counts');
    // Create a document with request IP and current time of request
    //col.insert({ip: req.ip, date: Date.now()});
    //col.count(function(err, count){
      //res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    //});
  //} else {
  //  res.render('index.html', { pageCountMessage : null});
  //}
res.sendFile('index.html',{root: __dirname + '/reactposts/'});	

}
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});
app.get('/initialize', function (req, res) {
 res.render('initialize.html');
});
// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
