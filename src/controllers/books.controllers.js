const service = require("../services/book.services");

const getBook = (req, res) => {
    service.getBook(req,res).then((users) => {
        res.status(200).send(users);
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}
const getBookbyPage = (req, res) => {
    service.getBookbyPage(req,res).then((users) => {
        res.status(200).send(users);
    }).catch((e) => {
        res.status(500).send("Internal Server Error");
    })
}


module.exports = {
    getBook,
    getBookbyPage
}