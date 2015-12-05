var plans = {};

var restify = require('restify');
var fs = require('fs');

// Allow cross domain communication with CORS
restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');

// Create server
var server = restify.createServer();

// Enable cross-domain communication using CORS
server.use(restify.CORS());

// Convert POSTed request to JSON object
server.use(restify.bodyParser());

// Get plan
server.get('/plans/:planId', function(req, res, next){
  var file = './data/'+req.params.planId+'.json';
  fs.exists(file, function(exists){
    if(exists){
      fs.readFile(file, 'utf8', function(err, data) {
        if(err){
          res.send(404, err);
        } else {
          res.send(JSON.parse(data));
        }
        next();
      });
    } else {
      res.send([]);
      next();
    }
  });
});

// Add a plan
server.put('/plans/:planId', function(req, res, next){
  var file = './data/'+req.params.planId+'.json';
  fs.writeFile(file, JSON.stringify(req.body.locationList), function(err){
    if(err) throw err;
    next();
  });
});

// Remove a plan
server.del('/plans/:planId', function(req, res, next){
  var file = './data/'+req.params.planId+'.json';
  fs.unlink(file, function(err){
    if(err) throw err;
    next();
  });
});

// Start server
server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});
