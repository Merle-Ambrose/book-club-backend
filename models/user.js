const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

// Schema is a structure to a document.
const userSchema = new Schema({
    username: {type: String, required: true, trim: true, unique: true},
    email: {type: String, required: true, trim: true, unique: true},
    pwd: {type: String, required: true},
    fname: {type: String, required: false, trim: true},
    lname: {type: String, required: false, trim: true},
    birthday: {type: Date, required: true},
    booksWritten: [ObjectId],
    firstLoginDate: {type: Date, required: true, default: Date.now},
    lastLoginDate: {type: Date, required: true, default: Date.now},
    accountEnabled: {type: Boolean, required: true, default: true}
});

// Model defines programming interface for interacting with the
// database (CRUD.)
const userModel = mongoose.model('users', userSchema);

module.exports = userModel;