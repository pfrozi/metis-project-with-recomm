var express         = require('express'),
    router          = express.Router(),
    mongoose        = require('mongoose'),        // mongo connection
    bodyParser      = require('body-parser'),     // parses information from POST
    methodOverride  = require('method-override'); // used to manipulate POST


//
router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
}));

//build the REST operations at the base for requesitions
//this will be accessible from http://127.0.0.1:3000/reqs if the default route for / is left unchanged
router.route('/')
    //GET all requisitions, showing a list of reqs
    .get(function(req, res, next) {

        var userLog  = req.session.userLog;


        if(!req.session || !userLog){

            res.render('login/show', {
                title: 'Login',
                message: "Sessão expirada."
              });
              return;
        }


        mongoose.model('Requisition').find({}, function (err, reqs) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({

                    html: function(){
                        res.render('reqs/index', {
                              title: 'Lista de Todos os Pedidos',
                              "reqs" : reqs,
                              "userLog" : userLog
                          });
                    },
                    //JSON response will show all user in JSON format
                    json: function(){
                        res.json(reqs);
                    }
                });
              }
        });
    })
    //POST a new requisition
    //called when the user click in a post button
    .post(function(req, res) {

        var userLog  = req.session.userLog;

        /*
        if(!req.session || !userLog){

            res.render('login/show', {
                title: 'Login',
                message: "Sessão expirada."
              });
              return;
        }
        */

        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var title       = req.body.titulo;
        var description = req.body.descricao;
        var tags        = req.body.tags;
        var modules     = req.body.modulos;
        var category    = req.body.categoria;

        console.log(category);
        console.log(title);
        console.log(description);
        console.log(tags);
        console.log(modules);

        var partsOfTags    = tags.split(',');
        var partsOfModules = modules.split(',');

        console.log(partsOfTags);
        console.log(partsOfModules);

        //call the create function for our database
        mongoose.model('Requisition').create({
            category    : category,
            title       : title,
            description : description,
            priority    : 0,
            tags        : partsOfTags,
            modules     : partsOfModules,
            user        : userLog
        }, function (err, requisition) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //user has been created
                  console.log('POST creating new requisition: ' + requisition);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){

                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("reqs");
                        // And forward to success page
                        res.redirect("/reqs");
                    },
                    //JSON response
                    json: function(){
                        res.json(requisition);
                    }
                });
              }
        });

    });

/* GET New user page. */
router.get('/new', function(req, res) {

    // get login session
    var userLog  = req.session.userLog;
    var userType = req.session.userType;
    console.log('Logged user.nick: '+ userLog.nick);
    console.log('Logged user.type: '+ userLog.type);

    res.render('reqs/new', { title: 'Adicionar Novo Pedido',"userLog" : userLog });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {

    //find the ID in the Database
    mongoose.model('Requisition').findById(id, function (err, requisition) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing (kick-off to callback)
            next();
        }
    });
});

// just show a requisition
router.route('/:id')
  .get(function(req, res) {

    mongoose.model('Requisition').findById(req.id)
        .populate("user")
        .populate({path: 'forum', options: { sort: { 'created': -1 } } })
        .deepPopulate("forum.user")
        .exec(function (err, requisition) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + requisition._id);

                var userLog  = req.session.userLog;

                // list top5 of similar requests
                mongoose.model('ReqDocumentDist')
                    .find({"requisitionA":requisition._id})
                    .sort({"distance": 1})
                    .limit(5)
                    .exec(function(err,reqDist){
                        if(err)
                            console.error(err);

                        reqDist.map(
                            function(a) {
                                mongoose.model('Requisition')
                                    .findById(a.requisitionB)
                                    .exec(function(err,reqDist2){
                                        if(err)
                                            console.error(err);
                                        else{
                                            console.log("#####");
                                            console.log(reqDist2.description);
                                        }
                                    });
                            });
                    }
                );

                // update visits field
                requisition.update({ visits : ++requisition.visits}, function (err, userUp) {
                    if (err) {
                        res.send("Error on visits update.");
                    } else {

                        res.format({
                            html: function(){
                                res.render('reqs/show', {
                                    "req" : requisition,
                                    "userLog": userLog
                                });
                            },
                            json: function(){
                                res.json(requisition);
                            }
                        });
                    }

                });
            }
    });
}).post(function(req, res) {

    var userLog  = req.session.userLog;

    var comment  = req.body.comment;
    var tags     = req.body.tags;

    console.log(comment);
    console.log(tags);

    var partsOfTags    = tags.split(',');

    console.log(partsOfTags);

    //call the create function for our database
    mongoose.model('Forum').create({
        comment     : comment,
        tags        : partsOfTags,
        user        : userLog
    }, function (err, forum) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        } else {
            //user has been created
            console.log('POST creating new forum: ' + forum);

            mongoose.model('Requisition').findByIdAndUpdate(req.id,
                    {$push: {"forum": forum}},
                    {safe: true, upsert: true})
                .exec(function (err, requisition) {
                    if (err) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        mongoose.model('Requisition').findById(req.id)
                            .populate("user")
                            .populate({path: 'forum', options: { sort: { 'created': -1 } } })
                            .deepPopulate("forum.user")
                            .exec(function (err, requisition) {
                                if (err) {
                                    console.log('GET Error: There was a problem retrieving: ' + err);
                                } else {
                                    console.log('GET Retrieving ID: ' + requisition._id);

                                    var userLog  = req.session.userLog;

                                    // update visits field
                                    requisition.update({ visits : ++requisition.visits}, function (err, userUp) {
                                        if (err) {
                                            res.send("Error on visits update.");
                                        } else {

                                            res.format({
                                                html: function(){
                                                    res.render('reqs/show', {
                                                        "req" : requisition,
                                                        "userLog": userLog
                                                    });
                                                },
                                                json: function(){
                                                    res.json(requisition);
                                                }
                                            });
                                        }

                                    });
                                }
                        });
                    }
            });


        }
    });



});



//GET the individual item by Mongo ID
router
    .get('/:id/edit', function(req, res) {
      //search for the user within Mongo
      mongoose.model('Requisition').findById(req.id, function (err, requisition) {
          if (err) {
              console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
              //Return the requisition
              console.log('GET Retrieving ID: ' + requisition._id);
              //format the date properly for the value to show correctly in our edit form
              res.format({
                  //HTML response will render the 'edit.jade' template
                  html: function(){
                         res.render('reqs/edit', {
                            requisition: requisition
                        });
                   },
                   //JSON response will return the JSON output
                  json: function(){
                         res.json(user);
                   }
              });
          }
      });
});
router
    .put('/:id/edit', function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var title       = req.body.title;
        var description = req.body.description;
        var priority    = req.body.priority;
        var tags        = req.body.tags;
        var modules     = req.body.modules;

        mongoose.model('Requisition').findById(req.id, function (err, requisition) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  requisition.update({
                          title       : title
                        , description : description
                        , priority    : priority
                        , tags        : tags
                        , modules     : modules
                        , modified    : new Date()

                    }, function (err, reqUp) {
                            if (err) {
                                res.send("There was a problem adding the information to the database.");
                            } else {

                                mongoose.model('Requisition').findById(req.id, function(err, newReq) {
                                    console.log('PUT editing new user: ' + reqUp);
                                    res.format({
                                      html: function(){
                                          res.render('reqs/show', {
                                            "requisition" : newReq
                                          });
                                      },
                                      json: function(){
                                          res.json(reqUp);
                                      }
                                    });
                                });

                            }
                  });
              }
        });

});

//DELETE a req by ID
router.get('/:id/delete', function (req, res){

    console.log("Remove a req item...");

    //find a req by ID
    mongoose.model('Requisition').findById(req.id, function (err, user) {
        if(err){
            return console.error(err);
        }else{
            console.log("Id found, deleting process will be start");
            //remove it from Mongo
            user.remove(function (err, requisitionRem) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + requisitionRem._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/reqs");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : requisitionRem
                               });
                         }
                      });
                }
            });


        }
    });


/*
    //find user by ID
    mongoose.model('Requisition').findById(req.id, function (err, requisition) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            user.remove(function (err, requisitionRem) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + requisition._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/reqs");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : requisition
                               });
                         }
                      });
                }
            });
        }
    });
    */
});

// Export all of routes
module.exports = router;
