var mongoose = require("mongoose");

var reqDocDistSchema = new mongoose.Schema({


    requisitionA   : {type: mongoose.Schema.ObjectId, ref: 'Requisition' },
    requisitionB   : {type: mongoose.Schema.ObjectId, ref: 'Requisition' },
    typeOfDistance : [String],
    distance       : [Number]

});

mongoose.model('ReqDocumentDist', reqDocDistSchema);
