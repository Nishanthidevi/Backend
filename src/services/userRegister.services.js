const Users = require('../models/userRegister.model');

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
        var user = await new Users({
            user_id: req.body.user_id,
            books: {
                book_id: req.body.book_id,
                bookMark: [{ data: req.body.bookMark }],
                notes: [{ data: req.body.notes }]
            }
        });
        return user.save();
    } catch (e) {
        return e;
    }
}

exports.updateUser = async (req, user) => {
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

exports.deleteUser = async (req) => {
    try {
        return await Users.findByIdAndDelete(req.params.id)
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