const mongoose = require('mongoose');

const ActiveBooksSchema = mongoose.Schema({
    book_id: String,
    activeUsers: [{
        user_id: String,
        timestamp: Date
    }]
})

module.exports = mongoose.model('ActiveBooks', ActiveBooksSchema,'ActiveBooks');