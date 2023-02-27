const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'The first name field is required!']
    },
    last_name: String,
    email: {
        type: String,
        required: [true, 'The email field is required!'],
        trim: true,
        // unique: 1
    },
    phone: Number,
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, 'Mininum length should be 8 characters']
    },
    is_active: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    deletedAt: {
        type: Date,
        default: null
        // default: Date.now()
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);