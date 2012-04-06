import time;

use test;

db.foo.insert({ "bar": "baz" });

var seed = function(n) {
  var i;
  for (i = 0; i < n; i++) {
    db.foo.insert({ "number": i });
  }
}

// drop documents in collection (slow)
seed(1000000);
db.foo.remove();

// drop collection (fast)
seed(1000000);
db.foo.drop();


// update document
var joe = { "name": "joe", "friends": 32, "enemies": 2 };
db.users.insert(joe);

joe = db.users.findOne();
joe.relationships = { "friends": joe.friends, "enemies": joe.enemies };
joe.username = joe.name;

delete joe.name;
delete joe.friends;
delete joe.enemies;

db.users.update({ "name": "joe" }, joe);


/*** update modifiers ***/
data = { "url": "www.example.com", "visits": 52 };
db.analytics.insert(data);

db.analytics.update({ "url": "www.example.com" }, { "$inc": { "pageviews": 1 } });


/*** $set / $unset modifiers ***/
user = { "name": "joe", "age": 30, "sex": "male", "location": "Wisconsin" };
db.users.remove();
db.users.insert(user);

db.users.update({ "name": "joe" }, { "$set": { "favourite book": "green eggs and ham" } });
db.users.update({ "name": "joe" }, { "$set": { "favourite book": ["cat's cradle", "foundation triology", "ender's game"] } });
db.users.update({ "name": "joe" }, { "$unset": { "favourite book": 1 } });


/*** $inc / $dec modifiers ***/
db.games.insert({ "game": "pinball", "user": "joe" });
db.games.update({ "game": "pinball", "user": "joe" }, { "$inc": { "score": 50 } });
db.games.update({ "game": "pinball", "user": "joe" }, { "$inc": { "score": 10000 } });


/*** array modifiers, $push, $pop, $pull, $addToSet ***/
db.blog.posts.drop();
db.papers.drop();
db.users.drop();
db.lists.drop();

// $push
var post = { "title": "A blog post", "content": "..." };
db.blog.posts.insert(post);

comment1 = { "comments": { "name": "joe", "email": "joe@example.com", "content": "nice post." } }
comment2 = { "comments": { "name": "jim", "email": "jim@example.com", "content": "awesome..." } }
db.blog.posts.update({ "title": "A blog post" }, { "$push": comment1 });
db.blog.posts.update({ "title": "A blog post" }, { "$push": comment2 });

// $push, $ne
var paper = { "title": "A modest proposal" };
db.papers.insert(paper);
db.papers.update({ "authors cited": { "$ne": "Richie" } }, { "$push": { "authors cited": "Richie" } });

// $addToSet
var user = { "username": "joe", "emails": ["joe@example.com", "joe@gmail.com", "joe@yahoo.com"] };
db.users.insert(user);
user = db.users.findOne();
db.users.update({ "_id": user.id }, { "$addToSet": { "emails": "joe@gmail.com" } });
db.users.update({ "_id": user.id }, { "$addToSet": { "emails": "joe@hotmail.com" } });
db.users.update({ "_id": user.id }, { "$addToSet": { "emails": { "$each": ["joe@php.net", "joe@example.com", "joe@python.org"] } } });

// $pull
db.lists.insert({ "todo": ["dishes", "laundry", "dry cleaning"] });
db.lists.update({}, { "$pull": { "todo": "laundry" } });

// positional array modifications
post = { "title": "A blog post", "content": "...", "comments": [{ "comment": "good post", "author": "John", "votes": 0 },
                                                                { "comment": "great post", "author": "Claire", "votes": 3 },
                                                                { "comment": "free watches", "author": "Alice", "votes": -1 }] };
db.blog.posts.insert(post);
post = db.blog.posts.findOne();
db.blog.posts.update({ "_id": post.id }, { "$inc": { "comments.0.votes": 1 } });


/*** modifier speed ***/
db.updates.drop();
db.updates.insert({ "x": 1 });
db.updates.findOne();                               // make sure insert is complete before we continue

for (var i = 0; i < 100000; i++) {
  db.updates.update({}, { "$inc": { "x": 1 } });    // $inc is fast, modifies in place
}

for (var i = 0; i < 100000; i++) {
  db.updates.update({}, { "$push": { "y": 1 } });   // $push is slow, modifies size of document
}


/*** upserts ***/
db.analytics.drop();
db.analytics.update({ "url": "/blog" }, { "$inc": { "visits": 1 } }, true);
db.analytics.update({ "url": "/blog" }, { "$inc": { "visits": 1 } }, true);


/*** save() shell helper ***/
db.foo.drop();
var x = db.foo.findOne();
x.num = 42;
db.foo.save(x);


/*** safe operations ***/
db.foo.drop();
db.foo.insert({ "_id": 123, "x": 1 });
db.foo.insert({ "_id": 123, "x": 2 });    // throws exception
