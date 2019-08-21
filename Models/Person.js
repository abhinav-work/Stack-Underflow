const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const personSchema  = new Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    profilepic: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/2/24/Missing_avatar.svg"
    },
    date: {
        type: Date, 
        default: Date.now
    }
});
module.exports = person = mongoose.model("myPerson", personSchema)