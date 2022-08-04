// COMMAND: npm run dev          ---------->         starts server with nodemon
// EXPRESS
const port = process.env.port || 9000;
const express = require('express');
const app = express();
// MONGOOSE
const {mongoose} = require('mongoose');
const userModel = require('./models/user.js');
const bookModel = require('./models/book.js');
const bookmarkModel = require('./models/bookmark.js');
const uri = "mongodb://localhost:27017/library";
mongoose.connect(uri);
console.log(`Connected to the database at ${uri}`);

// ============= DATABASE OPERATIONS START =============

// Find a specific book
async function readBook(id) {
  return await bookModel.findById(id);
  //return await bookModel.findOne({title: 'Lord of the Rings: Rewritten'});
}

// Find a specific chapter in a book and display the info about it
async function readBookChapter(bookId, chapterIndex) {
  try {
    let result = (await bookModel.findById(bookId)).chapters;
    // Check if left/right chapters good
    let rightChap = true;
    let leftChap = true;
    if(chapterIndex+1 >= result.length) {
      rightChap = false;
    }
    if(chapterIndex-1 < 0) {
      leftChap = false;
    }
    result = result[chapterIndex];
    return {
      chapter: result,
      rightChapterValid: rightChap,
      leftChapterValid: leftChap
    };
  }
  catch(err) {
    return {};
  }
}

async function userExists(uname) {
  let userDoc = await userModel.find({ username: uname });
  if(Object.keys(userDoc).length === 0) return true;
  return false;
}

async function login(uname, pwd) {
  let userDoc = await userModel.find({ username: uname });
  if(Object.keys(userDoc).length === 0) return false;
  if(userDoc.pwd === pwd) return true; // login successful
  return false;
}

async function makeUser(uname, email, pwd, fname, lname, bday) {
  await userModel.create({
    username: uname,
    email: email,
    pwd: pwd,
    fname: fname,
    lname: lname,
    birthday: bday
  });
}

// =============  DATABASE OPERATIONS END  =============

// Specify where static assets
app.use(express.static('public'));

// backend api
app.get("/test", (req, res) => {
    console.log("called");
    res.json({"users": ["userOne", "userTwo", "userThree"]});
});

// Sample id: 62a91602fbe1f257871ed7ba
// http://localhost:9000/book/62a91602fbe1f257871ed7ba/
app.get("/book/:id", (req, res) => {
    console.log(`Reading the book ${req.params.id}`);
    readBook(req.params.id)
    .then((result) => {
      res.send(result);
    }).catch((err) => {
      console.log("error sending book data");
      res.status(500).send(err);
    });
});

// http://localhost:9000/book/62a91602fbe1f257871ed7ba/chapter/0
app.get("/book/:bookId/chapter/:chapIndex", (req, res) => {
    console.log(`Reading the book ${req.params.bookId} at chapter ${req.params.chapIndex}`);

    readBookChapter(req.params.bookId, req.params.chapIndex)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log("error sending book/chapter data");
      res.status(500).send(err);
    });
});

app.get("/register/:uname", (req, res) => {
    userExists(req.params.uname)
      .then((result) => {
        console.log(result);
        res.json({isUnique: result});
      })
      .catch((err) => {
        console.log(err);
        res.json({isUnique: false});
      });
});

app.get("/login/:uname/:pwd", (req, res) => {
    login(req.params.uname, req.params.pwd)
      .then((result) => {
        console.log(result);
        res.json({loginSuccess: result});
      })
      .catch((err) => {
        console.log(err);
        res.json({loginSuccess: false});
      });
});

app.get("/register/:uname/:email/:pwd/:fname/:lname/:bday", (req, res) => {
    console.log(`Registering new user: ${req.params.uname}`);
    // Send back a response depending on if the operation was successful!
    try {
      makeUser(req.params.uname, req.params.email, req.params.pwd, req.params.fname, req.params.lname, req.params.bday);
      res.json({successful: true});
    }
    catch(err) {
      res.json({successful: false});
    }
});

app.get("/temp", (req, res) => {
    res.json({temp: true});
});

app.listen(port, () => {
    console.log('server up');
});
