const Users = require('../models/userRegister.model');
const _ = require("lodash");
const { filter } = require('lodash');

const getUsers = function (req) {
    try {
        return Users.find(req.query);
    } catch (e) {
        return e;
    }
}

const getUserById = function (req) {
    try {
        return Users.findById(req.params.id);
    } catch (e) {
        return e;
    }
}

const saveUser = async function (req) {
    try {
         const user = await Users.find({"user_id":req.user_id});
         if(!user.length > 0){
            const payload = {
                user_id: req.user_id,
                books: [
                    {
                        book_id: req.book_id,
                        bookMark: [ req.bookMark ],
                        notes: [ req.notes ]
                    }
                ]
            }
            var userRecord = new Users(payload);
            return userRecord.save();   
         } else {
            const user = await Users.findOne({"user_id":req.user_id, "books.book_id": req.book_id });
            if( _.isEmpty(user)){
                return await Users.findOneAndUpdate({ user_id: req.user_id },{
                    $push:{
                        books:  {
                            book_id: req.book_id,
                            bookMark: [ req.bookMark ],
                            notes: [ req.notes ]
                        }
                    }
                })
            } else {
                const selectedBook = user.books.filter((obj) =>  obj.book_id === req.book_id )[0];
                selectedBook.bookMark.push(req.bookMark);
                selectedBook.notes.push(req.notes);
                return await Users.findOneAndUpdate({"user_id":req.user_id, "books.book_id": req.book_id }, { $set: { 
                    "books.$.bookMark" : selectedBook.bookMark,
                    "books.$.notes" : selectedBook.notes
                  } 
                });
            }
         }
    } catch (e) {
        console.log("Error ",e)
        return e;
    }
}

const updateUser = function (req) {
    try {
        return Users.findByIdAndUpdate(req.params.id, req.body);
    } catch (e) {
        return e;
    }
}

const deleteUser = function (req) {
    try {
        return Users.findByIdAndDelete(req.params.id)
    } catch (e) {
        return e;
    }
}

module.exports = {
    getUsers,
    getUserById,
    saveUser,
    updateUser,
    deleteUser
}