var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),              //mongo connection
    bodyParser = require('body-parser'),         //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST


var counter_terms;
var counter_freqs = 0;

var counter_terms_len;
var counter_freqs_len = 0;

var buff = Buffer.from([]);

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
}));

/* GET config page. */
router.route('/')
    .get(function(req, res, next) {

        var userLog  = req.session.userLog;


        counter_terms     = 0;
        counter_terms_len = 0;

        mongoose.model('Stopword').find({"language" : "por" }, function (err, stopwords) {
              if (err) {
                  return console.error(err);
              } else {

                  mongoose.model('Term').find({},
                      function (err, terms) {
                            if (err) {
                                return console.error(err);
                            } else {

                                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                                res.format({

                                  html: function(){

                                      res.render('recsys/index',
                                          {     title: 'Configurações - RecSys'
                                              , 'userLog'   : userLog
                                              , "stopwords" : stopwords
                                              , "terms"     : terms
                                          }
                                      );
                                  },
                                  //JSON response will show all user in JSON format
                                  json: function(){
                                      res.json(reqs);
                                  }
                              });
                            }
                        }
                  );


              }
        });
});

function retira_acentos(palavra) {
    com_acento = 'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ';
    sem_acento = 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC';
    nova='';
    for(i=0;i<palavra.length;i++) {
      if (com_acento.indexOf(palavra.substr(i,1))>=0) {
      nova+=sem_acento.substr(com_acento.indexOf(palavra.substr(i,1)),1);
      }
      else {
       nova+=palavra.substr(i,1);
      }
    }
    return nova;
}

router.route('/create-freqs')
    //POST is going update the config information
    .post(function(req, res) {
        mongoose.model('Term').find({},function(err,terms){

            if (err) {
                return console.error(err);
            } else {
                //"_id":"5761fd16abd9161bf23cd580"
                mongoose.model('Requisition').find({  },function(err,reqs){

                    if (err) {
                        return console.error(err);
                    } else {

                        reqs.map(function(req){

                            var freq = [];

                            for(var i in terms){

                                var sum_len = req.ownTerms.filter( function( el ) {
                                      return el==terms[i].word;
                                  } ).length;

                                //if(sum_len>0)
                                //console.log(terms[i].word + ' > freq: ' + sum_len);

                                freq.push(sum_len);
                            }
                            req.update({freqTerms : freq },
                                function (err,reqAtz){
                                if (err) {
                                    return console.error(err);
                                }});
                        });

                        //console.log(reqs);


                        res.format({

                          //JSON response will show all user in JSON format
                          json: function(){
                              res.json( { "data":"ok" } );
                          }
                        });

                    }
                });
            }
        });
    });

router.route('/calculate-distances-eucl')
    .post(
        function (req,res){

            console.log("Start the Euclidean Distance Calc.");

            mongoose.model('ReqDocumentDist').remove(
                {typeOfDistance : "Euclidean"},
                function(err, reqs){
                    if (err)
                        return console.error(err);

                    mongoose.model('Requisition').find(
                        {},
                        function(err, reqs){

                            if(err)
                                console.error(err);

                            var eucl_list =[];

                            //for(var i=0;i<reqs.length-1;i++){
                            for(var i=0;i<10;i++){

                                for(var j=i+1;j<reqs.length;j++){
                                    // compare i with i++
                                    var distance = 0;
                                    for(var k=0;k<reqs[i].freqTerms.length;k++){

                                        distance += Math.pow(reqs[i].freqTerms[k]-reqs[j].freqTerms[k], 2);
                                    }

                                    distance = Math.pow(distance, 1/2);

                                    mongoose.model('ReqDocumentDist').create({
                                            requisitionA    : reqs[i],
                                            requisitionB    : reqs[j],
                                            typeOfDistance  : "Euclidean",
                                            distance        : distance
                                        },
                                        function (err,dist){
                                            if(err)
                                                console.error(err);
                                        }
                                    );

                                }

                                console.log("Distances Of",i,"ok!");

                            }
                        }
                    );
                }
            );


        }
    );

router.route('/create-terms')
    //POST is going update the config information
    .post(function(req, res) {

        counter_terms     = 0;
        counter_terms_len = 0;

        console.log("terms'll be removed.");
        mongoose.model('Term').remove({},
            function (err, terms) {

                console.log("terms'll be created.");

                mongoose.model('Stopword').find({},
                    function(err, stopwords){
                        if (err) {
                            return console.error(err);
                        } else {

                            mongoose.model('Requisition').find({}, function(err,reqs){

                                if (err) {
                                    return console.error(err);
                                } else {

                                    var stopwordsArray = stopwords.map(
                                        function(a) {
                                            return retira_acentos(a.stopword).toUpperCase();
                                        });

                                    var words = [];

                                    counter_terms_len = reqs.length + 10;

                                    for(var i in reqs){
                                        var doc = retira_acentos(
                                                reqs[i].description
                                                .replace(/(['";:,.\/?\\-_])/g, '')
                                                .replace(/([\(\)\[\]\{\}])/g, '')
                                                .replace(/([\!\@\#\$\%\^\&\*\`\´\=\+\<\>])/g, '')
                                                .trim())
                                            + " ";

                                        var docWords = doc.trim().split(" ");
                                        docWords = docWords.filter( function( el ) {
                                              return stopwordsArray.indexOf( el ) < 0;
                                            } ).filter( function( el ) {
                                                      return el.trim().length > 1;
                                                    } );

                                        reqs[i].update({
                                                ownTerms : docWords

                                            }, function (err, userUp) {
                                              if (err) {
                                                  res.send("There was a problem adding the information to the database.");
                                              }
                                        });

                                        words = words.concat(docWords);

                                        counter_terms++;
                                    }
                                    words = words.filter( function( el, pos ) {
                                          return words.indexOf(el) == pos;
                                        } );

                                    counter_terms += 5;

                                    //console.log(words);
                                    //console.log(words);

                                    //call the create function for our database
                                    words.map(
                                        function(a) {
                                            mongoose.model('Term').create({
                                                word    : a
                                            }, function (err, term) {
                                                  if (err) {
                                                      res.send("There was a problem adding the information to the database.");
                                                  }
                                            });

                                        });

                                    counter_terms += 5;

                                    res.format({

                                      //JSON response will show all user in JSON format
                                      json: function(){
                                          res.json( { "data":"ok" } );
                                      }
                                    });
                                }
                            });

                        }
                    }
                );


            }
        );
    }
);

router.route('/get-counters')
    .get(function(req, res) {

        console.log(counter_terms);
        console.log(counter_terms_len);

        res.format({

            //JSON response will show all user in JSON format
            json: function(){

                res.json( {
                    "counter_terms"    : counter_terms,
                    "counter_freqs"    : counter_freqs,
                    "counter_terms_len": counter_terms_len,
                    "counter_freqs_len": counter_freqs_len
                } );
          }
        });
    });

module.exports = router;
