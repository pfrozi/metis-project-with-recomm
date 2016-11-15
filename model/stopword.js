var mongoose = require("mongoose");

var stpwordSchema = new mongoose.Schema({
    stopword     : String,
    language     : String
});

mongoose.model('Stopword', stpwordSchema);
