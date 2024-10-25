const express = require('express');
const router = express.Router();
// Importing the data from our fake database files.
const posts = require("../data/posts");
const error = require("../utilities/error");

/////////////POSTS///////////////
router.get('/', (req, res) => {
    const links = [
        {
            href: "posts/:id",
            rel: ":id",
            type: "GET",
        },
    ];

    res.json({ posts, links });
})

router.get('/:id', (req, res, next) => {
    const post = posts.find(p => p.id == req.params.id)

    const links = [
        {
            href: `/${req.params.id}`,
            rel: "",
            type: "PATCH",
        },
        {
            href: `/${req.params.id}`,
            rel: "",
            type: "DELETE",
        },
    ];
    if (post) res.json({ post, links });
    else next()
})



// Creating a GET route for the entire posts database.
// This would be impractical in larger data sets.
router.get("/", (req, res) => {
    res.json(posts);
})
// Creating a simple GET route for individual posts,
// using a route parameter for the unique id.
router.get("/:id", (req, res, next) => {
    const post = posts.find(p => p.id == req.params.id)
    if (post) res.json(post);
    else next();
})

//create post
//Within the POST request route, we create a new post with the data given by the client.
router.post("/", (req, res, next) => {
    if (req.body.userId && req.body.title && req.body.content) {
        const post = {
            id: posts[posts.length - 1].id + 1,
            userId: req.body.userId,
            title: req.body.title,
            content: req.body.content
        }
        posts.push(post);
        res.json(post);
    } else {
        next(error(400, "Insufficient data")); //invokes error func from utilities
    }
})

//update post
//router.patch("/:id", (req, res) => {
//    const post = posts.find((p, i) => {
//        if (p.id == req.params.id) {
//            for (const key in req.body) {
//                p[key] = req.body[key];
//            }
//            return true;
//        }
//    })
//    if (post) { res.json(post); }
//    else throw "Post not found";
//})
router.patch("/:id", (req, res) => {
    const post = posts.find(p => p.id == req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    // Update the post with the provided data
    Object.keys(req.body).forEach(key => {
        post[key] = req.body[key];
    });
    // Respond with the updated post
    res.json(post);
});


//delete post
router.delete("/:id", (req, res, next) => {
    const postIndex = posts.findIndex(p => p.id == req.params.id);
    if (postIndex !== -1) {
        deletedPost = posts[postIndex];
        posts.splice(postIndex, 1);
        res.json(deletedPost);
    } else {
        next(error(400, `Post not found for the id:'${req.params.id}'`));
        //throw `Post not found for the id:'${req.params.id}'`;
    }

})

module.exports = router;