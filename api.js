/**
 *  Copyright 2015 John Ahlroos
 *
 *	This file is part of Travel Mapper.
 *
 *  Travel Mapper is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Travel Mapper is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Travel Mapper.  If not, see <http://www.gnu.org/licenses/>.
 */
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
