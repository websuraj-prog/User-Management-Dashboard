require('dotenv').config();
const express = require("express");

const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const db = require("./config/db");
const session = require("express-session");
const cookieParser = require('cookie-parser'); 
const route = require("./routes/usersRouter");

const controllers = require("./controllers/Authcontrollers")

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser()); 
app.use('/', route);

app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret", 
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");

// Connect to Server
db().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to the database:', err);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});
