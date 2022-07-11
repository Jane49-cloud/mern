const express = require('express')
router = express.Router()
usersRoute = require('../controllers/controllers')

router.get("/", usersRoute.userController)


module.exports = router