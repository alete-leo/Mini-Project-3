import express from "express";
import bodyParser from "body-parser";

console.log("Script is running");

const app = express();
const port = 3000;
const posts = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // for the css

app.get("/", (req, res) => {
  res.render("index.ejs");
});

/* 
app.post("/submit", (req, res) => {
  const numLetters = req.body["fName"].length + req.body["lName"].length;
  // from <input type="text" name="fName" placeholder="Blog Title" /> , <% if (locals.numberOfLetters) { %> , <h1>There are <%= numberOfLetters %> blog posts here.</h1>
  res.render("index.ejs", { numberOfLetters: numLetters });
});

*/

// the above is the default code taken from the numLetters exercise, establishing a connection & function for receiving and sending data



// blog routing

app.get("/delete/:id", (req, res) => { // goes to webpage of the :id var
    const postId = Number(req.params.id);
    const postToDelete = posts.find((post) => post.id === postId); 

    if (!postToDelete) { // the webpage was crashing w/o this
        return res.redirect("/");
    }

    res.render("index.ejs", {
        posts: posts, //gives post array 
        editPost: postToDelete //gives access to const postToEdit which finds the postID and content
    });
});

app.post("/delete/:id", (req, res) => {
    const postId = Number(req.params.id);
    const postIndex = posts.findIndex((post) => post.id === postId); //changed to find index, not matching with app.get yet but it's working

    if (postIndex === -1) {
        return res.redirect("/");
    }
    posts.splice(postIndex, 1);
    console.log("deleted");
    res.render("index.ejs", {
        posts: posts, //gives post array 

    });
});


//edit

app.get("/edit/:id", (req, res) => { // goes to webpage of the :id var
    const postId = Number(req.params.id);
    const postToEdit = posts.find((post) => post.id === postId);

    if (!postToEdit) { // the webpage was crashing w/o this
        return res.redirect("/");
    }

    res.render("index.ejs", {
        posts: posts, //gives post array 
        editPost: postToEdit //gives access to const postToEdit which finds the postID and content
    });
});

// updated edit post
app.post("/edit/:id", (req, res) => {
    const postId = Number(req.params.id);
    const postToEdit = posts.find((post) => post.id === postId);

    if (!postToEdit) { //anti-crash code again
        return res.redirect("/");
    }

    postToEdit.title = req.body.title;
    postToEdit.author = req.body.author;
    postToEdit.content = req.body.content;

    // res.redirect("/"); // having issues rn where it doesn't re-render what's in the array
    res.render("index.ejs", {
        posts: posts
    }); //this seemed to fix it
});




// blog stuff



// create the post from data
app.post("/submit", (req, res) => {
    const newPost = {
        id: Date.now(), // this makes a more complex id but it was easier
        title: req.body.title,
        author: req.body.author,
        content: req.body.content,
        date: new Date().toDateString()
    };

    posts.push(newPost); //from 212 js lsn, to add to end of array
    console.log(newPost);
    console.log(posts);

    res.render("index.ejs", {
        posts: posts
    });
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



