const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    books: [{
        book_id: String,
        bookMark: [],
        notes: []
    }]
});

module.exports = mongoose.model('User', UserSchema);