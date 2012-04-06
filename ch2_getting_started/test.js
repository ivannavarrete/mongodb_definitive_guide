use test;

post = { "title": "My Blog Post", "content": "Here's my blog post.", "date": new Date() };

db.blog.insert(post);
db.blog.find();
db.blog.findOne();

post.comments = [];

db.blog.update({ "title": "My Blog Post" }, post);
db.blog.remove({ "title": "My Blog Post" });
