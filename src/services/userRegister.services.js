const Users = require('../models/userRegister.model');
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
        return await Users.findById(req.params.id);
    } catch (e) {
        return e;
    }
};

exports.saveUser = async (req) => {
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

exports.updateAcitveBookUser = async (req, user) => {
    try {
        let userDetails = await Users.find({});
        // console.log("userDatails", userDetails)
        let updatedUser = await Users.findByIdAndUpdateOne(req.params.id, {user_id: req.body},{ newBookMark: [{ data: req.body.data }] },
            { newNotes: [{ data: req.body.data }] },
            {
                $push:
                {
                    bookMark: newBookMark,
                    notes: newNotes
                }
            }
        );
    } catch (e) {
        return e;
    }
}


// exports.activeBooks = async (req) => {
//     try {
//         return await ActiveBooks.findByIdAndDelete(req.body)
//     } catch (e) {
//         return e;
//     }
// }