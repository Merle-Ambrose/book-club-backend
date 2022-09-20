const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

// Create a chapter schema (insert into book schema)
const chapterSchema = new Schema({
    title: { type: String, required: false },
    authorNote: { type: String, required: false },
    textContents: { type: String, required: false }
});

//const chapterModel = mongoose.model('chapters', chapterSchema);

// Create a book schema
const bookSchema = new Schema({
    title: { type: String, required: true, trim: true },
    author: { type: ObjectId, required: true },
    summary: { type: String, default: '', trim: true },
    tws: [String],
    genre: { type: String, required: false },
    fandoms: [String],
    characters: [String],
    tags: [String],
    language: { type: String, required: false },
    wordcount: { type: Number, required: true },
    datePublished: { type: Date, required: true, default: Date.now() },
    dateUpdated: { type: Date, required: true, default: Date.now() },
    views: { type: Number, required: true, default: 0 },
    chapters: [chapterSchema]
});

const bookModel = new mongoose.model('books', bookSchema);

module.exports = bookModel;
