const mongoose = require('mongoose');
const speechSchema = new mongoose.Schema({
    text: String,
    url: String
});

const Speech = mongoose.model('Speech', speechSchema);
module.exports = Speech;