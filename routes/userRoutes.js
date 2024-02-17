const express = require('express');
const router  = express.Router();
const {getAllUsers,
    createNewUser,
    updateUser,
    deleteUser  } = require('../controller/usersController')


const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
    

router.route('/')   //all /users
    .get(getAllUsers)
    .post(createNewUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router;