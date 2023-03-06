const controller = require('../controllers/userRegister.controllers');
const express = require('express');
const router = express.Router();

router.get('/bookmarks', controller.getBookmarks);
router.get('/notes', controller.getNotes);
router.get('/summary', controller.getSummary);
router.get('/:id', controller.getUserById);
router.get('/', controller.getUsers);

router.post('/saveUser', controller.saveUser);
router.post('/updateActiveBookUser', controller.updateActiveBookUser);
router.post('/summarizeText', controller.summarizeText);
router.post('/summary', controller.updateSummarizeText);
router.post('/speech', controller.convertTextToSpeech);
router.post('/convertTextToSpeech', controller.convertTextToSpeechV2);

router.put('/updateBookmarks', controller.getUpdatatedBookmarks);
router.put('/updateNotes', controller.getUpdatatedNotes);

router.delete('/:id', controller.deleteUser);

module.exports = router;