const express = require('express')
const router = express.Router()
const photographyHandler = require('../router_handler/photography')

router.
get('/api/album', photographyHandler.getAllAlbum)
.get('/api/album/:id', photographyHandler.getOneAlbum)
.get('/api/design', photographyHandler.getAllDesign)

module.exports = router