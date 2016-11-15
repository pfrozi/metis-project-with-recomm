var mongoose = require("mongoose");

var forumSchema = new mongoose.Schema({
    user         : {type: mongoose.Schema.ObjectId, ref: 'User'},
    comment      : String,
    tags         : [String],
    created      : { type: Date, default: Date.now },
    modified     : { type: Date, default: Date.now },
});

mongoose.model('Forum', forumSchema);
