/*
  AUTHOR: Polina Tikhomirova
*/
// EXPRESS
require('dotenv').config();
const port = process.env.PORT || 9000;
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const app = express();
// IMPORT ROUTERS
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
// MONGOOSE
const { mongoose } = require('mongoose');
const userModel = require('./models/user.js');
const dbURL = "mongodb+srv://"+ process.env.DB_UNAME + ":"+ process.env.DB_PWD + "@book-club.stftns5.mongodb.net/library?retryWrites=true&w=majority";
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
mongoose.connect(dbURL, connectionParams)
  .then(() => {
    console.log(`Connected to the database at ${dbURL}`);
  })
  .catch((err) => {
    console.log(err);
  });

// Fix CORS errors
app.use(cors());
// Specify where static assets are located
app.use(express.static('public'));
// Lets application use JSON that gets
// passed up into the body of requests
app.use(express.json());


// ============= DATABASE OPERATIONS START =============

/* USER ACCOUNT OPERATIONS START */

async function createUser(uname, email, pwd, fname, lname, byear) {
  await userModel.create({
    username: uname,
    email: email,
    pwd: pwd,
    fname: fname,
    lname: lname,
    birthday: byear
  });
}

async function loginAuth(uname, pwd) {
  let userDoc = await userModel.findOne({ username: uname });
  if (Object.keys(userDoc).length === 0) return null;
  if (userDoc.pwd === pwd) return userDoc; // login successful
  return null;
}

/* USER ACCOUNT OPERATIONS END */

// =============  DATABASE OPERATIONS END  =============


// ============= TOKEN AUTHENTICATION START =============

// Generates access token
function generateAccessToken(userId) {
  return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

// ============= TOKEN AUTHENTICATION END =============

// ============= ROUTES START =============

// 'book' routes
app.use('/book', bookRoutes);

// 'user' routes
app.use('/user', userRoutes);

app.post("/login", (req, res) => {
  // Authenticate user
  loginAuth(req.body.uname, req.body.pwd)
    .then((result) => {
      // Pass jwt token to user
      const accessToken = generateAccessToken(result._id);
      res.json({ accessToken: accessToken });
    })
    .catch((err) => {
      console.log(err);
      res.status(418).send(err);
    });
  console.log("logging in test");
});

app.post("/register", (req, res) => {
  console.log(`Registering new user: ${req.body.uname}`);
  // Send back a response depending on if the operation was successful!
  try {
    createUser(req.body.uname, req.body.email, req.body.pwd, req.body.fname, req.body.lname, req.body.byear);
    res.json({ successful: true });
  }
  catch (err) {
    res.json({ successful: false });
  }
});

// ============= ROUTES END =============

app.listen(port, () => {
  console.log(`Server up on port ${port}.`);
});
