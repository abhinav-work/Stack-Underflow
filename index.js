const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const questions = require('./routes/api/questions');

//mongoDB config
const db= require('./setup/myurl.js').mongoURL;
mongoose
  .connect(db, { useNewUrlParser: true})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err + "AHHHHHH!!!!!"));

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use(passport.initialize());
require("./strategies/jsonwtStrategies")(passport);

app.use(auth);
app.use(profile);
app.use(questions);
app.use('/', (req, res)=>{
    res.send("Hey there!!");
});

app.listen(port, ()=>console.log("Server is running at " + port));
