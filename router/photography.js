const express = require('express')
const router = express.Router()

const photographyHandler = require('../router_handler/photography')

router.get('/album', photographyHandler.getAllAlbum)
router.get('/album/:id', photographyHandler.getOneAlbum)

//將路由對象共享出去
module.exports = router