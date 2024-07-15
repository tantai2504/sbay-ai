const express = require("express");
var path = require('path');
const app = express();
require('dotenv').config();
const port = 3000;
const indexRouter = require("./routes/index");

app.set('view engine', 'ejs');

// Optional since express defaults to CWD/views

app.set('views', path.join(__dirname, 'views'));

// Path to our public directory

app.use(express.static(path.join(__dirname, 'public')));

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').

app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
