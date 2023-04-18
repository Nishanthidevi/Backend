const controller = require('./books.controllers');
const express = require('express');
const router = express.Router();

router.get('/:key/:page', controller.getBookbyPage);
router.get('/:id', controller.getBook);

module.exports = router;