var mongoose = require("mongoose");

var reqDocSchema = new mongoose.Schema({

    requisition    : {type: mongoose.Schema.ObjectId, ref: 'Requisition' },
    termsFrequency : [Number]

});

mongoose.model('ReqDocument', reqDocSchema);
