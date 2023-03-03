const controller = require('../controllers/userRegister.controllers');
const express = require('express');
const router = express.Router();

router.get('/:id', controller.getUserById);
router.get('/', controller.getUsers);
router.delete('/:id', controller.deleteUser);

router.post('/saveUser', controller.saveUser);
router.post('/updateActiveBookUser', controller.updateActiveBookUser);
router.post('/summarizeText', controller.summarizeText);

router.get('/bookmarks', controller.getBookmarks);

router.put('/updateBookmarks', controller.getUpdatatedBookmarks);
router.put('/updateNotes', controller.getUpdatatedNotes);

router.post('/summary', controller.updateSummarizeText);
router.post('/speech', controller.convertTextToSpeech);

module.exports = router;