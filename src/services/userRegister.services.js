const Users = require('../models/userRegister.model');
const ActiveBooks = require('../models/activeBooks.model');
const _ = require("lodash");
const { filter } = require('lodash');

exports.getUsers = async (req) => {
    try {
        return await Users.find(req.query);
    } catch (e) {
        return e;
    }
};

exports.getUserById = async (req) => {
    try {
        return await Users.find({ user_id: req.params.id });
    } catch (e) {
        return e;
    }
};

exports.saveUser = async (req) => {
    try {
        const user = await Users.find({ "user_id": req.user_id });
        if (!user.length > 0) {
            const payload = {
                user_id: req.user_id,
                books: [
                    {
                        book_id: req.book_id,
                        bookMark: [req.bookMark],
                        notes: [req.notes]
                    }
                ]
            }
            var userRecord = new Users(payload);
            return userRecord.save();
        } else {
            const user = await Users.findOne({ "user_id": req.user_id, "books.book_id": req.book_id });
            if (_.isEmpty(user)) {
                return await Users.findOneAndUpdate({ user_id: req.user_id }, {
                    $push: {
                        books: {
                            book_id: req.book_id,
                            bookMark: [req.bookMark],
                            notes: [req.notes]
                        }
                    }
                })
            } else {
                const selectedBook = user.books.filter((obj) => obj.book_id === req.book_id)[0];
                selectedBook.bookMark.push(req.bookMark);
                selectedBook.notes.push(req.notes);
                return await Users.findOneAndUpdate({ "user_id": req.user_id, "books.book_id": req.book_id }, {
                    $set: {
                        "books.$.bookMark": selectedBook.bookMark,
                        "books.$.notes": selectedBook.notes
                    }
                });
            }
        }
    } catch (e) {
        console.log("Error ", e)
        return e;
    }
}

exports.updateActiveBookUser = async (req, res) => {
    try {
        const book = await ActiveBooks.findOne({ "book_id": req.book_id });
        if (_.isEmpty(book) || _.isEmpty(book.activeUsers)) {
            const filter = { book_id: req.book_id };
            const update = {
                activeUsers: [
                    {
                        user_id: req.user_id,
                        timestamp: new Date()
                    }
                ]
            }
            let doc = await ActiveBooks.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true // Make this update into an upsert
            });
            return doc;
        }
        const activeUsers = book.activeUsers;
        const filteredActiveUsers = activeUsers.filter((obj) => {
            return this.diff_minutes(obj.timestamp, new Date()) <= 10;
        });
        const existingUser = filteredActiveUsers.find((obj) => obj.user_id === req.user_id);
        if (filteredActiveUsers.length < 10) {
            for (var i = 0; i < filteredActiveUsers.length; i++) {
                if (filteredActiveUsers[i].user_id == req.user_id) {
                    filteredActiveUsers[i].timestamp = new Date();
                    break;
                } else if (!existingUser && filteredActiveUsers.length < 10) {
                    filteredActiveUsers.push({ user_id: req.user_id, timestamp: new Date() });
                    break;
                }
            }
        } else if (existingUser) {
            for (var i = 0; i < filteredActiveUsers.length; i++) {
                if (filteredActiveUsers[i].user_id == req.user_id) {
                    filteredActiveUsers[i].timestamp = new Date();
                    break;
                }
            }
        } else {
            throw { message: "Active users limit exceeded", status: 400 };
        }
        return await ActiveBooks.updateOne({ "book_id": req.book_id }, { $set: { activeUsers: filteredActiveUsers } });

    } catch (e) {
        throw e;
    }
}

exports.getBookmarks = async (req) => {
    try {
        return await Users.find({ user_id: req.query.user, "books.book_id": req.query.book },
            { "books.$": 1, _id: 0 });
    } catch (e) {
        return e;
    }
};

exports.diff_minutes = (dt2, dt1) => {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

// function diff_minutes(dt2, dt1){
//
//     var diff =(dt2. getTime() - dt1. getTime()) / 1000;
//     diff /= 60;
//     return Math. abs(Math. round(diff));
// }


// exports.activeBooks = async (req) => {
//     try {
//         return await ActiveBooks.findByIdAndDelete(req.body)
//     } catch (e) {
//         return e;
//     }
// }