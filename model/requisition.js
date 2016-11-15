var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var reqSchema = new mongoose.Schema({
    title        : String,
    description  : String,
    priority     : Number,
    created      : { type: Date, default: Date.now },
    modified     : { type: Date, default: Date.now },
    tags         : [String],
    modules      : [String],
    category     : [String],
    type         : String,
    user         : {type: mongoose.Schema.ObjectId, ref: 'User'},
    whoSucceeded : {type: mongoose.Schema.ObjectId, ref: 'User'},
    forum        : [{type: mongoose.Schema.ObjectId, ref: 'Forum'}],
    visits       : { type: Number, default: 0 },

    ownTerms     : [String],
    freqTerms    : [Number]
});

reqSchema.plugin(deepPopulate);
mongoose.model('Requisition', reqSchema);
