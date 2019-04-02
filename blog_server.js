"use strict";

const _            = require('lodash');
const express      = require('express');
const bodyParser   = require('body-parser');
const config  = require('./knexfile');

// Initialize Express.
const app = express();
app.use(bodyParser.json());

// Configure & Initialize Bookshelf & Knex.
console.log('Running in environment: ' + process.env.NODE_ENV);
const knex = require('knex')(config[process.env.NODE_ENV]);
const bookshelf = require('bookshelf')(knex);

// This is a good place to start!
var User = bookshelf.Model.extend({
  tableName: 'users',
  posts: function(){
    return this.hasMany(Posts);
  },
  comments: function(){
    return this.hasMany(Comments);
  }
})
var Posts = bookshelf.Model.extend({
  tableName: 'posts',
  user_id: function(){
    return this.belongsTo(User, 'user_id');
  },
  comments: function(){
    return this.hasMany(Comments);
  }
})
var Comments = bookshelf.Model.extend({
  tableName: 'comments',
  user_id: function(){
    return this.belongsTo(User, 'user_id')
  },
  post_id: function(){
    return this.belongsTo(Post, 'post_id')
  }
})


app.post('/user', (req, res) => {
  if( req.body.name && req.body.username && req.body.email){
    User.forge(req.body).save().then(function(user){
      res.send(
        {id: user.id}
      )
    })
    .then(function(error){
      res.sendStatus(500);
    })
  }
  else{
    res.sendStatus(400)
  }
})

app.post('/post', (req, res) =>{
  if (!!req.body.title && req.body.body){
    Posts.forge(req.body).save.then(function(post){
      res.send(
        {id: post.id}
      )
    })
    .catch(function(error){
      res.sendStatus(500)
    })
  }
  else{
    res.sendStatus(500) ;
  }
})

app.get('./posts', (req, res) => {
  Posts.fetchAll()
  .then(function(returned){
    res.send(returned);
  })
  .catch(function(error){
    res.sendStatus(500) ;
  })
})
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

exports.User = User ;
exports.Posts = Posts ;
exports.Comments = Comments ;
