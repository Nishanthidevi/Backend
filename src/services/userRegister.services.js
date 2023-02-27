const Users = require('../models/userRegister.model');

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

const saveUser = function (req) {
    try {
        var user = new Users(req.body);
        return user.save();   
    } catch (e) {
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