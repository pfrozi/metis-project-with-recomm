var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
//var MongoStore   = require('connect-mongo')(session);
var mongoose     = require('mongoose');


// controllers
var routes       = require('./routes/index');
var users        = require('./routes/users');
var login        = require('./routes/login');
var requisitions = require('./routes/reqs');
var config       = require('./routes/config');
var recsys       = require('./routes/recsys');

// db variables
var db = require("./model/db");

// mongoose schemas
var user            = require('./model/users');
var requisition     = require('./model/requisition');
var forum           = require('./model/forum');
var stopword        = require('./model/stopword');
var term            = require('./model/term');
var reqdocument     = require('./model/reqdocument');
var reqdocumentDist = require('./model/reqdocumentdist');

var app = express();

var counter_terms;
var counter_freqs = 0;

var counter_terms_len;
var counter_freqs_len = 0;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

// session configuration
var mysession = session({
      secret: 'VouEmboraPraPasargada',
      resave: true,
      saveUninitialized: true,
      cookie: { secure: false },
      //store: new MongoStore({ mongooseConnection: mongoose.connection })
});

app.use(mysession);

// map controllers
app.use('/', routes);
app.use('/users', users);
app.use('/login', login);
app.use('/reqs', requisitions);
app.use('/config', config);
app.use('/recsys', recsys);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
