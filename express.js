// Define dependencies
var express = require('express'),
    mongoskin = require('mongoskin'),
    bodyParser = require('body-parser');

// Instantiate express
var app = express();

// We'll be using the body parser middleware
app.use(bodyParser());

// Using mongoskin to connect to the local db
var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true});

// When the request specifies a collection name, save the mongo collection to the request property
app.param('collectionName', function(req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    return next();
});

// Provide a friendly message for blank requests
app.get('/', function(req, res) {
   res.send('Please select a collection, e.g., /collections/messages')
});

// GET any collection limited to 10 items, sorted by id
app.get('/collections/:collectionName', function(req, res, next) {
    req.collection.find({}, {limit:10, sort:[['_id', -1]]}).toArray(function(e, results) {
        if (e) {
            return next(e);
        }
        res.send(results);
    });
});

// GET an object from a collection resource specified by id
app.get('/collections/:collectionName/:id', function(req, res, next) {
   req.collection.findById(req.params.id, function(e, result) {
      if (e) {
          return next(e);
      }
       res.send(result);
   });
});

// POST (insert) an object to any collection
app.post('/collections/:collectionName', function(req, res, next) {
   req.collection.insert(req.body, {}, function(e, results) {
       if (e) {
           return next(e);
       }
       res.send(results);
   });
});

// PUT (update) an object in any collection
app.put('/collections/:collectionName/:id', function(req, res, next) {
    req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false},
    function(e, result) {
        if (e) {
            return next(e);
        }
        res.send(result === 1 ? {msg:'success'} : {msg:'error'});
    });
});

// DELETE and object in any collection
app.del('/collections/:collectionName/:id', function(req, res, next) {
    req.collection.removeById(req.params.id, function(e, result) {
        if (e) {
            return next(e);
        }
        res.send(result === 1 ? {msg:'success'} : {msg:'error'})
    });
});

// Start listening on port 3000
app.listen(3000);