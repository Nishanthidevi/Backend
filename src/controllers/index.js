const controller = require('../controllers/userRegister.controllers');
const express = require('express');
const router = express.Router();

router.get('/:id', controller.getUserById);
router.get('/', controller.getUsers);
router.post('/', controller.saveUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;