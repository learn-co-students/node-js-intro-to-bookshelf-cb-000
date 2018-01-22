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
	posts: function() {
		return this.hasMany(Posts, 'author'); //by default would have been post_id
																					//but since that is an author in the post model
																					//we specify the author attribute.
	},
	comments: function() {
		return this.hasMany(Comments);
	}
})

const Posts = bookshelf.Model.extend({
	tableName: 'posts',
	hasTimestamps: true,
	author: function() {
		return this.belongsTo(User, 'author');
	},
	comments: function() {
		return this.hasMany(Comments);
	}
})

const Comments = bookshelf.Model.extend({
	tableName: 'comments',
	hasTimestamps: true,
	user: function() {
		return this.belongsTo(User);
	},
	post: function() {
		return this.belongsTo(Posts);
	}
})
exports.User = User;
exports.Posts = Posts;
exports.Comments = Comments;




app.get('/', (req,res) => {
	res.send("Hello, world.");
});

app.post('/user', (req, res) => {
	 let remail = req.body.email;
	 let rname = req.body.name;
	 let rusername = req.body.username;

	 if(remail && rname && rusername){
		 knex('users')	//need to change this stuff to Bookshelf.js queries!!
		 .returning('id')
		 .insert({
			 name: rname,
			 email: remail,
			 username: rusername
		 })
		 .then((user) => {
			 res.send({id: parseInt(user)});
		 })
	 }else {
		 res.status(400).send();
	 }
});

app.get('/user/:id', (req, res) => {
	knex.select('id','name','username','email','created_at', 'updated_at')
	.from('users')
	.where({id: req.params.id})
	.then((user) => {
		if (user.length){
			res.send(user[0]);
		}else {
			res.status(404).send();
		}
	})
});

app.post('/post', (req, res) => {
	let pTitle = req.body.title;
	let pBody = req.body.body;
	let pAuthor = req.body.author;


	if(pTitle && pBody && pAuthor){

		knex('posts')
		.returning('id')
		.insert({
			title: pTitle,
			body: pBody,
			author: pAuthor
		})
		.then((post) => {
			res.send({id: parseInt(post)});
		})
	}else {
		res.status(400).send();
	}
})

app.get('/post/:id', (req, res) => {


	Posts.where({id: req.params.id})
		.fetch({withRelated: ['author', 'comments']})
		.then((post) => {
			 if (post){
				 res.send(post);

			 }else {
				 res.status(404).send();
				}
		})
});


app.get('/posts', (req,res) => {
	Posts.fetchAll()
	.then((posts) => {
		res.send(posts);
	})
});

app.post('/comment', (req,res) => {
	console.log(req.body)
	const user_id = req.body.user_id;
	const post_id = req.body.post_id;
	const cBody = req.body.body;
	let cUser = {};
	let cPost = {};
  if(user_id && post_id && cBody){

		  knex.select('id','name','username','email', 'created_at', 'updated_at')
			.from('users')
			.where({id: user_id})
			.then((user) => {
				cUser = user;
			});

			knex.select('id', 'title', 'author', 'body', 'created_at', 'updated_at')
			.from('posts')
			.where({id: post_id})
			.then((post) => {
				cPost = post;
			})

			knex('comments')	//need to change this stuff to Bookshelf.js queries!!
			.returning('id')
			.insert({
				body: cBody,
				user_id: cUser.id,
				post_id: cPost.id
			})
			.then((comment) => {
				res.send({id:parseInt(comment)})
			})

	}else {
		res.status(400).send();
	}


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
