var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),              //mongo connection
    bodyParser = require('body-parser'),         //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST


router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
}));

/* GET home page. */
router.route('/')
    .get(function(req, res, next) {
        res.render('login/show', { title: 'Login' });
    })
    //POST to login user
    .post(function(req, res) {
        var nick     = req.body.nick;
        var password = req.body.password;

        mongoose.model('User').find({
                nick     : nick,
                password : password
            },
            function (err, user) {
                if (err) {
                    console.log('Erro nao tratado.');
                    res.render('login/show', { title: 'Login'
                        , message: "Desculpe, mas um erro não tratado ocorreu."
                        , oldNick: nick });

                } else if(!user.length){
                    console.log('Usuario nao encontrado ou senha invalida.');
                    res.render('login/show', {
                            title: 'Login',
                            message: "Usuário não encontrado ou senha inválida.",
                            oldNick: nick
                        }
                    );

                } else {
                    console.log('User login: ' + user);

                    // store user data in session
                    req.session.userLog  = user[0];

                    // Verifying the type of user. If user doesn't have a defined type, customer is used by default
                    if(user.type=='D'){
                        res.format({
                            html: function(){
                                res.redirect("/reqs");
                            },
                            json: function(){
                                res.json(user);
                            }
                        });
                    } else{
                        res.format({
                            html: function(){
                                res.redirect("/reqs");
                            },
                            json: function(){
                                res.json(user);
                            }
                        });
                    }


                }
            }
        );

    }
);

module.exports = router;
