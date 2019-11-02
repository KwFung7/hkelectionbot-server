const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./routers');
const port = process.env.PORT || 3000;

let app = express();
app.use(bodyParser.json());
app.use('/', apiRouter);

app.listen(port, () => console.log(`Server listening on port ${port}`));

