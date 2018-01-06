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

// Models
const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  posts: function() {
    return this.hasMany(Posts, 'author');
  },
  comments: function() {
    return this.hasMany(Comments);
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
  }
});

const Comments = bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
  user: function() {
    return this.belongsTo(User);
  },
  post: function() {
    return this.belongsTo(Posts);
  }
});

exports.User = User;
exports.Posts = Posts;
exports.Comments = Comments;

// User routes
app.get('/user/:id', (req, res) => {
  let id = req.params.id;

  User.forge({id: id})
    .fetch()
    .then((user) => {
      if (_.isEmpty(user)) {
        return res.sendStatus(404);
      }
      res.send(user)
    })
    .catch((err) => {
      return res.sendStatus(500);
    });
});

app.post('/user', (req, res) => {
  if (_.isEmpty(req.body)) {
    return res.sendStatus(400);
  }

  User.forge(req.body)
    .save()
    .then((user) => {
      res.send({id: user.id});
    })
    .catch((err) => {
      return res.sendStatus(500);
    });
});

// Post routes
app.get('/posts', (req, res) => {
  Posts
    .collection()
    .fetch()
    .then((posts) => {
      if(_.isEmpty(posts)) {
        return res.sendStatus(404);
      }
      res.send(posts)
    })
    .catch((err) => {
      console.log(err)
      return res.sendStatus(500);
    });
});

app.get('/post/:id', (req, res) => {
  let id = req.params.id;

  Posts
    .forge({id: id})
    .fetch({withRelated: ['author', 'comments']})
    .then((post) => {
      if (_.isEmpty(post)) {
        return res.sendStatus(404);
      }
      res.send(post)
    })
    .catch((err) => {
      console.log(err);
      return res.sendStatus(500);
    });
});

app.post('/post', (req, res) => {
  if (_.isEmpty(req.body)) {
    return res.sendStatus(400);
  }

  Posts.forge(req.body)
    .save()
    .then((post) => {
      res.send({id: post.id});
    })
    .catch((err) => {
      return res.sendStatus(500);
    });
});

// Comments Route
app.post('/comment', (req, res) => {
  if (_.isEmpty(req.body)) {
    return res.sendStatus(400);
  }

  Comments.forge(req.body)
    .save()
    .then((comment) => {
      res.send({id: comment.id});
    })
    .catch((err) => {
      return res.sendStatus(500);
    });
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

