"use strict";

const _            = require('lodash');
const express      = require('express');
const bodyParser   = require('body-parser');
const config  = require('./knexfile.js');

// Initialize Express.
const app = express();
app.use(bodyParser.json());

// Configure & Initialize Bookshelf & Knex.
console.log('Running in environment: ' + process.env.NODE_ENV);
const knex = require('knex')(config[process.env.NODE_ENV]);
const bookshelf = require('bookshelf')(knex);

// This is a good place to start!
const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  posts: function(){
    return this.hasMany(Posts,'author');
  }
});

const Posts = bookshelf.Model.extend({
  tableName: 'posts',
  hasTimestamps: true,
  author: function() {
    return this.belongsTo(User, 'author');
  },
  comments: function() {
    return this.hasMany(Comments);
  },
});

const Comments = bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },
  post: function() {
    return this.belongsTo(Posts);
  },
});

exports.User = User;
exports.Posts = Posts;
exports.Comments = Comments;


app.get('/user/:id',function(req,res){
  const id = req.params.id;
  new User({id: id})
    .fetch()
    .then(function(user){
      res.send(user.toJSON())
    })
    .catch(function(error){
      res.status(404).send('Not Found');
    });
});


app.post('/user',function(req,res){
    const bodyObject = req.body;
    if (bodyObject.hasOwnProperty("name") && bodyObject.hasOwnProperty("email")
        && bodyObject.hasOwnProperty("username")) {
          User.forge({name:bodyObject.name, email:bodyObject.email, username:bodyObject.username})
            .save()
            .then(function(user){
              res.send({id:user.id})
            })
            .catch(function(error){
              res.status(404).send()
            });
    } else {
      res.status(400).send();
    }
});


app.post('/post',function(req,res){
    const bodyObject = req.body;
    if (bodyObject.hasOwnProperty("title") && bodyObject.hasOwnProperty("body")) {
      Posts.forge({title:bodyObject.title, body: bodyObject.body,author:bodyObject.author})
        .save()
        .then(function(post){
          res.send({id:post.id})
        })
        .catch(function(error){
          res.status(404).send()
        });
    } else {
      res.status(400).send();
    }
});

app.get('/posts',function(req,res){
  new Posts()
    .fetchAll()
    .then(function(posts){
      res.send(posts.toJSON())
    })
    .catch(function(error){

    });
});

app.get('/post/:id',function(req,res){
  const id = req.params.id;
  new Posts({id: id})
    .fetch({withRelated:['author','comments']})
    .then(function(post){
      res.send(post.toJSON())
    })
    .catch(function(error){
      res.status(404).send('Not Found');
    });

});

app.post('/comment',function(req,res){
    const bodyObject = req.body;
    if (bodyObject.hasOwnProperty("body")) {
      Comments.forge({body: bodyObject.body, user_id: bodyObject.user_id, post_id: bodyObject.post_id})
        .save()
        .then(function(comment){
          res.send({id:comment.id})
        })
        .catch(function(error){
          res.status(404).send()
        });
    } else {
      res.status(400).send()
    }
});

// Exports for Server hoisting.
const listen = (port) => {
  return new Promise((resolve, reject) => {
    app.listen(port, () => {
      resolve();
    });
  });
};

exports.up = (justBackend) => {
  return knex.migrate.latest([process.env.NODE_ENV])
    .then(() => {
      return knex.migrate.currentVersion();
    })
    .then((val) => {
      console.log('Done running latest migration:', val);
      return listen(3000);
    })
    .then(() => {
      console.log('Listening on port 3000...');
    });
};
