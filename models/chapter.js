const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create a chapter schema
const chapterSchema = new Schema({
    title: { type: String, required: false },
    authorNote: { type: String, required: false },
    textContents: { type: String, required: true }
});

const chapterModel = mongoose.model('chapters', chapterSchema);

module.exports = chapterModel;