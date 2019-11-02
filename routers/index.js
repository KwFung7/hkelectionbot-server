const express = require('express');
let router = express.Router();

router.get('/', () => console.log('Hello World!'));

module.exports = router;
