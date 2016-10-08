var express = require('express');
var router = express.Router();
var User = require('../lib/userModel');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sessionlogindb');


/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  if(!req.session.user) {
    res.render('login', {title: "subhdcode Session"}, function(err, html) {
      res.redirect('/login');
    });
  }
  else {
    res.render('dashboard', {title: "subhdcode Session", user: req.session.user.username, todos: req.session.user.todos}, function(err, html) {
      res.redirect('/dashboard');
    });
  }
});

router.get('/login', function(req, res) {
  res.render('login', {title: "subhdcode Session"});
});

router.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username, password: password}, function(err, user) {
    if(err) {
      console.log(err);
      return res.status(500).send();
    }

    if(!user) {
      var newUser = new User();
      newUser.username = username;
      newUser.password = password;

      newUser.save(function(err, savedobj) {
        if(err) {
          console.log(err);
          res.status(500).send();
        }

        user = savedobj;
        console.log("new user_: ");
        console.log(user);

        req.session.user = user;
        res.render('dashboard', {user: req.session.user.username, todos: req.session.user.todos}, function(err, html) {
          res.redirect('/dashboard');
        });

        //res.send("<p>you are registered. welcome. Start your own todo list ..</p> <a href='/dashboard'>Dashboard</a>");
        //return res.send("registered");
        //res.status(200).send('welcome ' + newUser.username);
        //res.send("Start your own todo list. Go to your ");
      });
    }
    else {
      console.log(user);

      req.session.user = user;
      //res.render('dashboard', {title: "subhdcode Session", user: req.session.user.username, todos: req.session.user.todos}, function(err, html) {
        //res.redirect('/dashboard');
      //});

      res.render('dashboard', {user: req.session.user.username, todos: req.session.user.todos}, function(err, html) {
        res.redirect('/dashboard');
      });
    }


  });

});


router.get('/dashboard', function(req, res) {
  if(!req.session.user) {
    res.status(401).send("you'r not loggedin. unouthorised");
  }

  res.render('dashboard', {user: req.session.user.username, todos: req.session.user.todos});
});

router.post('/dashboard', function(req, res) {
  var item = req.body.item;
  var updateIndex = req.body.index;
  var updateItem = req.body.update;

  //find user and update todos fo that user;
  User.findOneAndUpdate(
    {username: req.session.user.username},
    {$push: {todos: item}},
    {upsert: true, new: true},
    function(err, data) {
      console.log("todo added.");
      res.render('dashboard', {user: req.session.user.username, todos: data.todos});
    }
  );
});


router.get('/dashboard/delete/:index', function(req, res) {
  var index = req.params.index;

  User.find(
    {username: req.session.user.username},
    function(err, data) {
      model = data[0];
      model.todos.splice(index-1, 1);
      model.save(function(updatedItem) {
        console.log("todo removed.");
        console.log(model.todos);

        res.render('dashboard', {user: req.session.user.username, todos: model.todos});
      });

    }
  );
});

router.get('/dashboard/update/:index', function(req, res) {
  var index = req.params.index;
  index--;

  User.find(
    {username: req.session.user.username},
    function(err, data) {
      model = data[0];
      var val = model.todos[index];

      res.render('update', {index: index, todo: val});
    }
  );

});


router.post('/dashboard/update/:index', function(req, res) {
  var updated = req.body.updatedItem;
  var index = req.params.index;

  User.find(
    {username: req.session.user.username},
    function(err, data) {
      model = data[0];
      model.todos.set(index, updated);

      model.save(function(updatedItem) {
        console.log("todo updated:");
        console.log(model.todos);

        res.render('dashboard', {user: req.session.user.username, todos: model.todos});
      });

    }
  );
});

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    console.log(err);
    //res.status(500).send();
  });
  res.redirect('/login');
});

module.exports = router;
