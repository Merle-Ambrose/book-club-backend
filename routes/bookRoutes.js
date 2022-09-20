// EXPRESS
const express = require('express');
const userModel = require('./models/user.js');
const bookModel = require('./models/book.js');
const router = express.Router();
// MONGOOSE
const userModel = require('./models/user.js');
const bookModel = require('./models/book.js');

// ============= DATABASE OPERATIONS START =============

/* USER ACCOUNT OPERATIONS START */

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

// Find a specific book
async function getBook(id) {
    return await bookModel.findById(id);
    //return await bookModel.findOne({ title: 'Lord of the Rings: Rewritten' });
}

// Find a specific chapter in a book and display the info about it
async function getBookChapter(bookId, chapterIndex) {
    // Update how many users viewed this book
    let book = await bookModel.findById(bookId);
    await bookModel.updateOne({ _id: bookId }, {
        views: book.views + 1
    });

    // Get chapter information to display to user
    try {
        let result = book.chapters;
        // Check if left/right chapters good
        let rightChap = true;
        let leftChap = true;
        if (parseInt(chapterIndex) + 1 >= result.length) {
            rightChap = false;
        }
        if (chapterIndex - 1 < 0) {
            leftChap = false;
        }
        result = result[chapterIndex];
        return {
            chapter: result,
            rightChapterValid: rightChap,
            leftChapterValid: leftChap
        };
    }
    catch (err) {
        return {};
    }
}

// Pagination of books
async function getFilteredBooks(query) {
    let limit = query.numberPerPage;
    let currPage = query.currPage;
    if (currPage < 0) currPage = 0;
    let skip = currPage * limit;
    delete query.currPage;
    delete query.numberPerPage;
    let sort = {};
    if (query.views) {
        sort.views = query.views;
        delete query.views;
    };
    if (query.wordcount) {
        sort.wordcount = query.wordcount;
        delete query.wordcount;
    };

    // Skipping depends on current number of books
    // AND current page number
    let documentCount = await bookModel.find(query).countDocuments();
    let books = await bookModel.find(query).limit(limit).skip(skip).sort(sort);
    return {
        books,
        documentCount
    };
}

// Create a book and assign it to a user/author
async function createBook(title, authorId, summary, tws, genre, fandoms, characters, tags, language) {
    let book = await bookModel.create({
        title: title,
        author: authorId,
        summary: summary,
        tws: tws,
        genre: genre,
        fandoms: fandoms,
        characters: characters,
        tags: tags,
        language: language,
        wordcount: 0,
        datePublished: new Date(),
        dateUpdated: new Date(),
        views: 0,
        chapters: []
    });
    let user = await userModel.findById(authorId);
    user.booksWritten.push(book._id);
    user.save((err) => { console.log(err) });
    await createEmptyChapter(book._id);
    return book._id.toString();
}

// Update book user data
async function updateBook(bookId, title, authorId, summary, tws, genre, fandoms, characters, tags, language) {
    await bookModel.updateOne({ _id: bookId },
        {
            title: title,
            author: authorId,
            summary: summary,
            tws: tws,
            genre: genre,
            fandoms: fandoms,
            characters: characters,
            tags: tags,
            language: language,
            dateUpdated: new Date()
        });
}

// Delete a user's book
async function deleteBook(userId, bookId) {
    let user = await userModel.findById(userId);
    user.booksWritten.filter(book => book !== bookId);
    await user.save((err) => {
        console.log(err);
    });
    await bookModel.deleteOne({ _id: bookId });
}

// Delete a specific chapter out of a book
async function deleteChapter(bookId, chapterIndex) {
    let book = await bookModel.findById(bookId);
    book.chapters.splice(chapterIndex, 1);
    console.log(book.chapters);
    await book.save((err) => {
        console.log(err);
    });
}

// Update book chapter
async function updateChapter(bookId, chapterIndex, title, authorNote, textContents) {
    const book = await bookModel.findById(bookId);
    let totalWordcount = book.wordcount;
    let prevWordcount = book.chapters[chapterIndex].textContents.split(" ").length;
    let currentWordcount = textContents.split(" ").length;

    // Update the chapter contents
    book.chapters[chapterIndex].title = title;
    book.chapters[chapterIndex].authorNote = authorNote;
    book.chapters[chapterIndex].textContents = textContents;
    await book.save((err) => {
        console.log(err);
    });

    // Calculate the total wordcount
    totalWordcount = totalWordcount - prevWordcount + currentWordcount;
    await bookModel.updateOne({ _id: bookId }, {
        wordcount: totalWordcount
    });
}

// Make new, empty chapter for book
async function createEmptyChapter(bookId) {
    let book = await bookModel.findById(bookId);
    await book.chapters.push({
        title: '',
        authorNote: '',
        textContents: ''
    });
    await book.save((err) => {
        console.log(err);
    });
}

// Create a chapter with already filled-in info
async function createChapter(bookId, title, authorNote, textContents) {
    await bookModel.findById(bookId).chapters.push({
        title: title,
        authorNote: authorNote,
        textContents: textContents
    });
    await bookModel.save((err) => {
        console.log(err);
    });
}

// Get/read book document
async function getBook(bookId) {
    return await bookModel.findById(bookId);
}

// Get all of a user's books they've ever written
async function getAllUserBooks(userId) {
    return (await userModel.findById(userId)).booksWritten;
}

/* BOOK OPERATIONS END */

// =============  DATABASE OPERATIONS END  =============


// Pagination of books (get specific books w/ filters)
router.get("/filter/:genre/:language/:views/:wordcount/:numberPerPage/:currPage", (req, res) => {
    let query = {};
    if (req.params.genre.trim()) query.genre = req.params.genre;
    if (req.params.language.trim()) query.language = req.params.language;
    if (req.params.views.trim()) query.views = req.params.views;
    if (req.params.wordcount.trim()) query.wordcount = req.params.wordcount;
    if (req.params.numberPerPage.trim()) query.numberPerPage = req.params.numberPerPage;
    if (req.params.currPage.trim()) query.currPage = req.params.currPage;
    getFilteredBooks(query)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});

// Create book
router.post("/create", authenticateToken, (req, res) => {
    userOwnsBook(req.userId.userId, req.body.bookId)
        .then((result) => {
            if (result) {
                createBook(req.body.title, req.userId.userId, req.body.summary, req.body.tws, req.body.genre, req.body.fandoms, req.body.characters, req.body.tags, req.body.language)
                    .then((result) => {
                        res.send({ bookId: result });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500);
                    });
            }
            else {
                res.status(403);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});

// Update book
router.put("/update", authenticateToken, (req, res) => {
    userOwnsBook(req.userId.userId, req.body.bookId)
        .then((result) => {
            if (result) {
                updateBook(req.body.bookId, req.body.title, req.userId.userId, req.body.summary, req.body.tws, req.body.genre, req.body.fandoms, req.body.characters, req.body.tags, req.body.language)
                    .then((result) => {
                        res.send({ bookId: result });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500);
                    });
            }
            else
                res.status(403);
        }
        )
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});

// Delete book
router.post("/delete", authenticateToken, (req, res) => {
    userOwnsBook(req.userId.userId, req.body.bookId)
        .then((result) => {
            if (result) {
                deleteBook(req.userId.userId, req.body.bookId)
                    .then((result) => {
                        res.status(200);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500);
                    });
            }
            else {
                console.log("This user doesn't have access");
                res.status(403);
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
});


// Delete chapter
router.post("/chapter/delete", authenticateToken, (req, res) => {
    console.log("deleted chapter");
    console.log(req.userId.userId);
    console.log(req.body.bookId);
    userOwnsBook(req.userId.userId, req.body.bookId)
        .then((result) => {
            console.log(result);
            if (result) {
                deleteChapter(req.body.bookId, req.body.chapterIndex)
                    .then((result) => {
                        console.log(result);
                        res.status(200);
                        res.end();
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500);
                        res.end();
                    });
            }
            else {
                res.status(403);
                res.end();
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.end();
        });
});

router.post("/chapter/createEmpty", authenticateToken, (req, res) => {
    console.log(`Creating empty chapter in ${req.body.bookId}`);
    userOwnsBook(req.userId.userId, req.body.bookId)
        .then((result) => {
            if (result) {
                createEmptyChapter(req.body.bookId)
                    .then((result) => {
                        console.log(`Added chapter for book ${req.body.bookId}`);
                        res.end();
                    })
                    .catch((err) => {
                        res.status(500);
                    });
            }
            else {
                res.status(403);
            }
        })
        .catch((err) => {
            console.log("error getting user data");
            console.log(err);
            res.status(500);
        });
});

router.put("/chapter/update", authenticateToken, (req, res) => {
    userOwnsBook(req.userId.userId, req.body.bookId)
        .then((result) => {
            if (result) {
                updateChapter(req.body.bookId, req.body.chapterId, req.body.title, req.body.authorNote, req.body.textContents)
                    .then((result) => {
                        console.log(`Updated chapter: ${req.body.chapterId} for book ${req.body.bookId}`);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
            else {
                res.status(403);
            }
        })
        .catch((err) => {
            console.log("error getting user data");
            res.status(500).send(err);
        });
});

router.get("/:bookId/chapter/:chapIndex", (req, res) => {
    console.log(`Reading the book ${req.params.bookId} at chapter ${req.params.chapIndex}`);

    getBookChapter(req.params.bookId, req.params.chapIndex)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log("error sending book/chapter data");
            res.status(500).send(err);
        });
});

// Read a specific book
router.get("/:id", (req, res) => {
    getBook(req.params.id)
        .then((result) => {
            res.send(result);
        }).catch((err) => {
            console.log("error sending book data");
            res.status(500).send(err);
        });
});

module.exports = router;
