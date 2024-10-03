const express = require('express')
const router = express.Router()
const handler = require('../router_handler/photography')

router.
get('/api/album', handler.getAllAlbum)
.get('/api/album/:id', handler.getOneAlbum)
.get('/api/design', handler.getAllDesign)

module.exports = router