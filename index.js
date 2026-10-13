import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";

console.log("Script is running");

const app = express();
const port = 3000;
// const posts = [];

//from ls, connect postgres
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BlogDB",
    password: "p0sut0gur3su",
    port: 5432,
});

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // for the css



// user remember
app.use(session({
    secret: "shouldBeSecureButIdc",
    resave: false, // doesn't save sess when no change
    saveUninitialized: false // doesn't save new untouched sess, base code from ex
}));

// check signed in
function requireLogin(req, res, next) {
    if (!req.session.user) { // from request, ! use rdoesn't exist
        return res.redirect("/signin"); // have them sign in
    }

    next();
}



// get posts from db
async function getPosts() {
    const result = await db.query(
        "SELECT * FROM blogs ORDER BY date_created DESC"
    );

    return result.rows;
}
// new /, wait for posts first before render
app.get("/", async (req, res) => {
    try {
        const posts = await getPosts();

        res.render("index.ejs", {
            posts: posts,
            currentUser: req.session.user
        });
    } catch (err) {
        console.log(err);
    }
});




// and that signup and signin page
app.get("/signup", (req, res) => {
    res.render("signup.ejs", {
        error: null
    });
});
app.get("/signin", (req, res) => {
    res.render("signin.ejs", {
        error: null
    });
});


// new acc
app.post("/signup", async (req, res) => {
    const userId = req.body.user_id;
    const password = req.body.password;
    const name = req.body.name;

    if (!userId || !password || !name) {
        return res.status(400).render("signup.ejs", {
            error: "Please fill in all three fields."
        });
    }

    try {
        // check tkaen
        const result = await db.query(
            "SELECT user_id FROM users WHERE user_id = $1",
            [userId]
        );
        if (result.rows.length > 0) {
            return res.status(409).render("signup.ejs", {
                error: "That user ID is already taken. Please choose another."
            });
        }
        // insert db
        await db.query(
            "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
            [userId, password, name]
        );

        // Send the new user to the signin page
        res.redirect("/signin");
    } catch (err) {
        console.log(err);
    }
});


// signin funct
app.post("/signin", async (req, res) => {
    const userId = req.body.user_id;
    const password = req.body.password;

    try {
        // find matching ID and pass
        const result = await db.query(
            "SELECT user_id, name FROM users WHERE user_id = $1 AND password = $2",
            [userId, password]
        );
        if (result.rows.length === 0) {
            return res.status(401).render("signin.ejs", {
                error: "Incorrect info. Try again."
            });
        }

        // save to sess
        req.session.user = {
            user_id: result.rows[0].user_id,
            name: result.rows[0].name
        };

        // redirect to blog
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});






// blog routing
//deleted old code

// new create post
app.post("/submit", requireLogin, async (req, res) => {
    const title = req.body.title;
    const body = req.body.content;

    if (!title || !body) {
        return res.status(400);
    }
    try {
        // save post connected to user
        await db.query(
            "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, NOW())",
            [
                req.session.user.name,
                req.session.user.user_id,
                title,
                body
            ]
        );

        // reload
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("There was a problem creating your blog post.");
    }
});



/* sample
[
  {
    id: 1,
    title: "post",
    author: "",
    date: "",
    content: "hi"
  },
  {
    id: 2,
    title: "post 2",
    author: "",
    date: "",
    content: ""
  }
]
*/




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



