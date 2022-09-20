// EXPRESS
const express = require('express');
const router = express.Router();
// MONGOOSE
const userModel = require('../models/user.js');
const authenticateToken = require('../utils/authentication');


// ============= DATABASE OPERATIONS START =============

/* USER ACCOUNT OPERATIONS START */

async function updateUser(userId, email, pwd, fname, lname, byear) {
    await userModel.updateOne(
        { _id: userId },
        {
            email: email,
            pwd: pwd,
            fname: fname,
            lname: lname,
            birthday: byear
        }
    );
}

// Update specified user information except the user's password
async function updateUserNotPwd(userId, email, fname, lname, byear) {
    await userModel.updateOne(
        { _id: userId },
        {
            email: email,
            fname: fname,
            lname: lname,
            birthday: byear
        }
    );
}

async function getAllUserInfo(userId) {
    return await userModel.findById(userId);
}

async function userExists(uname) {
    let userDoc = await userModel.find({ username: uname });
    if (Object.keys(userDoc).length === 0) return true;
    return false;
}

// Check if user has priveledges writing/editing a book
async function userOwnsBook(userId, bookId) {
    let userBooks = (await userModel.findById(userId)).booksWritten;
    let bookFound = userBooks.find((book, index) => {
        if (book.toString() === bookId) return true;
    });
    return bookFound;
}

/* USER ACCOUNT OPERATIONS END */

/* BOOK OPERATIONS START */

// Get all of a user's books they've ever written
async function getAllUserBooks(userId) {
    return (await userModel.findById(userId)).booksWritten;
}

/* BOOK OPERATIONS END */

// =============  DATABASE OPERATIONS END  =============



// Check if user owns a specific book
router.get("/owns/:bookId/:userId", (req, res) => {
    console.log(`Checking if user ${req.params.userId} owns ${req.params.bookId}`);

    userOwnsBook(req.params.userId, req.params.bookId)
        .then((result) => {
            res.json({
                authorized: result
            });
        })
        .catch((err) => {
            console.log("error getting user data");
            res.status(500).send(err);
        });
});

// Get all of a user's books they've written
router.get("/getAllBooks", authenticateToken, (req, res) => {
    getAllUserBooks(req.userId.userId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log("Error sending book data");
            console.log(err);
            res.status(500).send(err);
        });
});

router.get("/find/:uname", (req, res) => {
    console.log("Finding user: " + req.params.uname);
    userExists(req.params.uname)
        .then((result) => {
            res.json({ isUnique: result });
        })
        .catch((err) => {
            console.log(err);
            res.json({ isUnique: false });
        });
});

router.get("/get", authenticateToken, (req, res) => {
    getAllUserInfo(req.userId.userId)
        .then((result) => {
            result.pwd = "";
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});

router.post("/update", authenticateToken, (req, res) => {
    updateUser(req.userId.userId, req.body.email, req.body.pwd, req.body.fname, req.body.lname, req.body.byear)
        .then((result) => {
            console.log(result);
            res.status(200);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});

router.post("/updateNotPwd", authenticateToken, (req, res) => {
    updateUserNotPwd(req.userId.userId, req.body.email, req.body.fname, req.body.lname, req.body.byear)
        .then((result) => {
            console.log(result);
            res.status(200);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});

module.exports = router;
