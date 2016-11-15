var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    name:     String,
    nick:     String,
    password: String,
    created:  { type: Date, default: Date.now },
    type:     { type: String, default: "D"    }, // D - Developer, C - Customer, A - Analiser

});

mongoose.model('User', userSchema);
