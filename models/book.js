const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

// Create a book schema
const bookSchema = new Schema({
    title: { type: String, required: true, trim: true },
    author: { type: ObjectId, required: true },
    summmary: { type: String, required: true, trim: true },
    rating: { type: String, required: false },
    tws: [String],
    genre: { type: String, required: false },
    fandoms: [String],
    characters: [String],
    tags: [String],
    language: { type: String, required: false },
    wordcount: { type: Number, required: true },
    datePublished: { type: Date, required: true },
    dateUpdated: { type: Date, required: true },
    likes: { type: Number, required: true },
    views: { type: Number, required: true },
    chapters: [ObjectId]
});

const bookModel = new mongoose.model('books', bookSchema);

module.exports = bookModel;