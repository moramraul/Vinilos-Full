/* require('./database/mongo.cnx') */
require("./database/mongo")
const express = require("express");
const app = express();
const router = require("./routes/routes");
const session = require("express-session");



app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
    secret: '123456',
    resave: true,
    saveUninitialized: true
}));


app.use("/", router);

app.listen(3000);