const controller = require('../controllers/userRegister.controllers');
const express = require('express');
const router = express.Router();

router.get('/:id', controller.getUserById);
router.get('/', controller.getUsers);
router.post('/saveUser', controller.saveUser);
router.post('/updateAcitveBookUser', controller.updateAcitveBookUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;