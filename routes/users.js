const express = require('express');
const router = express.Router();
// Importing the data from our fake database files.
const users = require("../data/users");
const error = require("../utilities/error");

// BASE PATH FOR THIS ROUTER IS: /api/users

//////////////USERS//////////////
// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get('/', (req, res) => {
    const links = [
        {
            href: "users/:id",
            rel: ":id",
            type: "GET",
        },
    ];

    res.json({ users, links });
})

// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get('/:id', (req, res, next) => {
    const user = users.find(u => u.id == req.params.id)
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

    if (user) res.json({ user, links });
    else next();
})


// Creating a GET route for the entire users database.
// This would be impractical in larger data sets.
router.get("/", (req, res) => {
    res.json(users);
})
// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get("/:id", (req, res, next) => {
    const user = users.find(u => u.id == req.params.id)
    if (user) {
        res.json(user);
    } else next();
})

//create user
//Within the POST request route, we create a new user with the data given by the client.
// We should also do some more robust validation of existance of user with username(id created dynamically) and all other fields required
router.post("/", (req, res, next) => {
    if (req.body.name && req.body.username && req.body.email) {
        const foundUser = users.find(u => u.username === req.body.username);
        if (foundUser) {
            //res.json({ error: "Username already taken" });
            return next(error(400, "Username already taken"));
        }
        const user = {
            id: users[users.length - 1].id + 1,
            name: req.body.name,
            username: req.body.username,
            email: req.body.email
        }
        users.push(user);
        res.json(user);
    } else {
        next(error(401, "Insufficient data"));
    }
})

//update user
router.patch("/:id", (req, res, next) => {
    const user = users.find((u, i) => {
        if (u.id == req.params.id) {
            for (const key in req.body) {
                u[key] = req.body[key];
            }
            return true;
        }
    })
    if (user) { res.json(user); }
    //else throw "User not found";
    else next();
})

//delete user
router.delete("/:id", (req, res, next) => {
    //const user = users.find((u, i) => {
    //    if (u.id == req.params.id) {
    //        users.splice(i, 1);
    //        return true;
    //    }
    //})
    //if (user) res.json(user);
    //else throw `User not found for the id:'${req.params.id}'`

    const userIndex = users.findIndex(u => u.id == req.params.id);
    if (userIndex !== -1) {
        deletedUser = users[userIndex];
        users.splice(userIndex, 1);
        res.json(deletedUser);
    } else {
        next(error(400, `User not found for the id:'${req.params.id}'`));
    }

})

module.exports = router;