const express = require("express");
const app = express();
require('dotenv').config()
const port = process.env.PORT || 3000;
//Importing or connecting routers
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const error = require('../utilities/error');
const path = require('path');


//Middleware
//body-parser in-built in express, inorder to get that
app.use(express.urlencoded({ extended: true })); //to parse incoming form data
app.use(express.json({ extended: true })); //to parse incoming json data

// New logging middleware to help us keep track of
// requests during testing!
app.use((req, res, next) => {
    const time = new Date();

    console.log(
        `-----
  ${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
    );
    if (Object.keys(req.body).length > 0) {
        console.log("Containing the data:");
        console.log(`${JSON.stringify(req.body)}`);
    }
    next();
});

// Valid API Keys.
//apiKeys = ["perscholas", "ps-example", "hJAsknw-L198sAJD-l3kasx"];
const apiKeys = process.env["API-KEYS"]
//api-key middleware
app.use("/api", (req, res, next) => {
    const key = req.query["api-key"]
    if (!key) {
        return res.status(400).json({ error: "API-KEY required" });
    }
    //check for key validity
    if (!apiKeys.includes(key)) {
        return res.status(401).json({ error: "Invalid API-KEY" });
    }
    req.key = key;
    next();
})

//setting routers, routers middleware
app.use("/api/users", usersRouter)
app.use("/api/posts", postsRouter)


// New User form
app.get("/users/new", (req, res) => {
    // only works for GET and POST request be default
    // if you are trying to send a PATCH, PUT, DELETE, etc. Look into method-override packed 
    res.send(`
      <div>
        <h1>Create a User</h1>
        <form action="/api/users?api-key=${apiKeys[0]}" method="POST">
          Name: <input type="text" name="name" />
          <br />
          Username: <input type="text" name="username"/>
          <br />
          Email: <input type="text" name="email" />
          <br />
          <input type="submit" value="Create User" />
        </form>
      </div>
      `)
})



// Download Example 
app.use(express.static('./data'))

app.get("/get-data", (req, res) => {
    res.send(`
      <div>
        <h1>Download Data</h1>
        <form action="/download/users.js">
          <button>Download Users data</button>
        </form>
  
        <form action="/download/posts.js">
          <button>Download Posts data</button>
        </form>
      </div>
      `)
})

app.get("/download/:filename", (req, res) => {
    res.download(path.join(__dirname, 'data', req.params.filename))
})


// Adding some HATEOAS links.
app.get("/", (req, res) => {
    res.json({
        links: [
            {
                href: "/api",
                rel: "api",
                type: "GET",
            },
        ],
    });
});

// Adding some HATEOAS links.
app.get("/api", (req, res) => {
    res.json({
        links: [
            {
                href: "api/users",
                rel: "users",
                type: "GET",
            },
            {
                href: "api/users",
                rel: "users",
                type: "POST",
            },
            {
                href: "api/posts",
                rel: "posts",
                type: "GET",
            },
            {
                href: "api/posts",
                rel: "posts",
                type: "POST",
            },
        ],
    });
});



// 404 Middleware
app.use((req, res, next) => {
    next(error(404, "Resource was Not Found"));
});

// Error-handling middleware.
// Any call to next() that includes an
// Error() will skip regular middleware and
// only be processed by error-handling middleware.
// This changes our error handling throughout the application,
// but allows us to change the processing of ALL errors
// at once in a single location, which is important for
// scalability and maintainability.
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: err.message });
});


app.get("/", (req, res) => {
    res.send("Work in progress!");
});

app.listen(port, () => {
    console.log(`Server listening on port: ${port}.`);
});



//// Custom 404 (not found) middleware.
//// Since we place this last, it will only process
//// if no other routes have already sent a response!
//// We also don't need next(), since this is the
//// last stop along the request-response cycle.
////error handling middleware
//app.use((err, req, res, next) => {
//    res.status(404).json({ error: err });
//})
