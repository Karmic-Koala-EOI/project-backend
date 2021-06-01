const router = require('express').Router()
const socialontroller = require('./social_media.controller');

router.post('/tweets',socialontroller.postTweet);

module.exports = router;