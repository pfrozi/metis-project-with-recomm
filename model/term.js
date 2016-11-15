var mongoose = require("mongoose");

var termSchema = new mongoose.Schema({
    word     : String
});

mongoose.model('Term', termSchema);
