const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

// Create a bookmark schema
const bookmarkSchema = new Schema({
    userId: { type: ObjectId, required: true },
    notes: { type: String, required: false }
});

const bookmarkModel = mongoose.model('bookmarks', bookmarkSchema);

module.exports = bookmarkModel;