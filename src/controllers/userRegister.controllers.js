const service = require("../services/userRegister.services");

const getUsers = (req, res) => {
    service.getUsers(req).then((users) => {
        res.status(200).send(users);
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}

const getUserById = (req, res) => {
    service.getUserById(req).then((user) => {
        res.status(200).send(user);
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}

const saveUser = (req, res) => {
    console.log("Request.body ", req.body)
    service.saveUser(req.body).then((user) => {
        res.status(201).send(user);
    }).catch((e) => {
        console.log("erorrrrrr---->", e)
        res.status(500).send("Internal Server Error");
    })
}

const updateActiveBookUser = (req, res) => {
    service.updateActiveBookUser(req.body, res).then((user) => {
        res.status(201).send("User updated Successfully");
    }).catch((e) => {
        res.status(e.status || 500).send(e.message || "Internal Server Error");
    })
}

const summarizeText = function(req, res) {
    service.summarizeText(req.body, res).then(function(result) {
        res.status(201).send({"summary": result});
    }).catch(function(e) {
        res.status(e.status || 500).send(e.message || "Internal Server Error");
    })
}

const deleteUser = (req, res) => {
    service.deleteUser(req).then((user) => {
        res.status(200).send("User deleted Successfully");
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}
const getBookmarks = (req, res) => {
    service.getBookmarks(req).then((user) => {
        res.status(200).send(user)
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}

const getSummary = (req, res) => {
    service.getSummary(req).then((user) => {
        res.status(200).send(user)
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}

const getNotes = (req, res) => {
    console.log("=",req.query)
    service.getNotes(req).then((user) => {
        res.status(200).send(user)
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}

const getUpdatatedBookmarks = function (req, res) {
    service.getUpdatatedBookmarks(req).then(function (updatedData) {
        res.status(200).send(updatedData);
    }).catch(function (e) {
        console.log("errorrrrrrrrrr", e)
        res.status(500).send("Internal Server Error");
    })
}

const getUpdatatedNotes = function (req, res) {
    service.getUpdatatedNotes(req).then(function (updatedData) {
        res.status(200).send(updatedData);
    }).catch(function (e) {
        res.status(500).send("Internal Server Error");
    })
}

const updateSummarizeText = function (req, res) {
    service.updateSummarizeText(req).then(function (data) {
        res.status(200).send(data);
    }).catch(function (e) {
        res.status(500).send("Internal Server Error");
    })
}

const convertTextToSpeech = function (req, res) {
    service.convertTextToSpeech(req).then(speech => {
        console.log('Speech:', speech);
        res.status(200).send(speech);
    }).catch(err => {
        console.error(err);
    });
}

const convertTextToSpeechV2 = function (req, res) {
    service.convertTextToSpeechV2(req.body).then(speech => {
        console.log('Speech:', speech);
        res.status(200).send(speech);
    }).catch(err => {
        console.error(err);
    });
}

const getPdfExtractedPages = function (req, res) {
    service.getPdfExtractedPages().then(function (data) {
        console.log("testing")
        res.status(200).send(data);
    }).catch(function (e) {
        res.status(500).send("Internal Server Error");
    })
}

module.exports = {
    getUsers,
    getBookmarks,
    getUserById,
    saveUser,
    updateActiveBookUser,
    deleteUser,
    // getUpdatatedBookmarks,
    // getUpdatatedNotes,
    updateSummarizeText,
    convertTextToSpeech,
    summarizeText,
    convertTextToSpeechV2,
    getNotes,
    getSummary,
    getPdfExtractedPages
}