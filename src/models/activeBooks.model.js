const mongoose = require('mongoose');

const ActiveBooksSchema = mongoose.Schema({
    book_id: String,
    activeUsers: [{
        user_id: String,
        timestamp: true
    }]
})

module.exports = mongoose.model('ActiveBooks', ActiveBooksSchema);