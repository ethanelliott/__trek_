var express = require('express');
var crypto = require('crypto');
var mongo = require('mongodb');
var session = require('client-sessions');
var numeral = require('numeral');
var schedule = require('node-schedule');
var router = express.Router();

/*
var schedule = require('node-schedule');
var date = new Date(2012, 11, 21, 5, 30, 0);
var x = 'Tada!';
var j = schedule.scheduleJob(date, function(y){
  console.log(y);
}.bind(null,x));
x = 'Changing Data';
*/

/* GET home page. */
router.get('/', function(req, res, next)
{
  var db = req.dbUser;
	var collection = db.get('user');
  var dbFeed = req.dbFeed;
  var collectionFeed = dbFeed.get('feed');

  if (req.session && req.session.user)
  {
    var query = collection.find({'username':req.session.user.username}).then(
      function(value)
      {
        if(value)
        {
          collectionFeed.find({},{},function(e,docs){
            res.render('feed', { title: 'Feed', posts: docs});
          });
        }
        else {
          res.render('index', { title: 'Home'});
        }
      });
    }
    else {
      res.render('index', { title: 'Home'});
    }
});

/* GET feed page. */
router.get('/feed', function(req, res, next)
{
  var postid = req.params.postid;
  var db = req.dbUser;
	var collection = db.get('user');
  var dbFeed = req.dbFeed;
  var collectionFeed = dbFeed.get('feed');
	if (req.session && req.session.user)
	{
		var query = collection.find({'username':req.session.user.username}).then(
			function(value)
			{
				if(value)
				{
          if (postid)
          {
            collectionFeed.find({'_id':postid},{},function(e,docs){
          		res.render('feed', { title: '', posts: docs});
          	});
          }
          else
          {
            collectionFeed.find({},{},function(e,docs){
          		res.render('feed', { title: 'Feed', posts: docs});
          	});
          }
				}
				else
				{
					req.session.reset();
					res.redirect('/login');
				}

			}
		);
	}
	else
	{
		req.session.reset();
		res.redirect('/login');
	}
});

router.get('/user/:userid', function(req, res, next)
{
  var userid = req.params.userid;
  var db = req.dbUser;
	var collection = db.get('user');
  if (req.session && req.session.user)
	{
		var query = collection.find({'username':req.session.user.username}).then(
			function(value)
			{
				if(value)
				{
          if (userid.length === 24)
          {
            collection.find({'_id':userid},function(e,docs){
              if (e) { console.log(e); res.send(e); return;}
              else
              {
                res.render('user', { title: '', user: docs});
              }
          	});
          }
          else
          {
            res.redirect('/feed');
          }
				}
				else
				{
					req.session.reset();
					res.redirect('/login');
				}

			}
		);
	}
	else
	{
		req.session.reset();
		res.redirect('/login');
	}
});


/* GET post page. */
router.get('/post/:postid', function(req, res, next)
{
  var postid = req.params.postid;
  var db = req.dbUser;
	var collection = db.get('user');
  var dbFeed = req.dbFeed;
  var collectionFeed = dbFeed.get('feed');
	if (req.session && req.session.user)
	{
		var query = collection.find({'username':req.session.user.username}).then(
			function(value)
			{
				if(value)
				{
          if (postid.length === 24)
          {
            collectionFeed.find({'_id':postid},function(e,docs){
              if (e) { console.log(e); res.send(e); return;}
              else
              {
                res.render('feed', { title: '', posts: docs});
              }
          	});
          }
          else
          {
            res.redirect('/feed');
          }
				}
				else
				{
					req.session.reset();
					res.redirect('/login');
				}

			}
		);
	}
	else
	{
		req.session.reset();
		res.redirect('/login');
	}
});

/* GET login page. */
router.get('/login', function(req, res, next)
{
	var db = req.dbUser;
	var collection = db.get('user');
	if (req.session && req.session.user)
	{
		var query = collection.find({'username':req.session.user.username}).then(
			function(value)
			{
				if(value)
				{
					res.redirect('feed');
				}
				else
				{
					var errorString = '';
					switch (req.query.error)
					{
						case '2':	//User has entered incorrect password
							errorString = "Incorrect password / username!";
						break;
						default:
							errorString = "";
						break;
					}
					res.render('login', { title: 'Login', error: errorString});
				}
			}
		);
	}
	else
	{
		var errorString = '';
		switch (req.query.error)
		{
			case '2':	//User has entered incorrect password
				errorString = "Incorrect password / username!";
			break;
			default:
				errorString = "";
			break;
		}
		res.render('login', { title: 'Login', error: errorString});
	}
});

/* GET schoollist page. */
router.get('/schoollist', function(req, res)
{
	var db = req.dbSchool;
	var collection = db.get('school');
	collection.find({},{},function(e,docs){
		res.render('schoollist', {
			"schoollist" : docs,
			"title": "School List"
		});
	});
});

/* GET postList page. */
router.get('/postlist', function(req, res)
{
	var db = req.dbFeed;
	var collection = db.get('feed');
	collection.find({},{},function(e,docs){
		res.render('postlist', {"title": "Post List","postlist" : docs});
	});
});

/* GET Userlist page. */
router.get('/userlist', function(req, res)
{
	var db = req.dbUser;
	var collection = db.get('user');
	if (req.session && req.session.user)
	{
		var query = collection.find({'username':req.session.user.username}).then(
			function(value)
			{
				if(value)
				{
					res.locals.user = value[0];
					collection.find({},{},function(e,docs){
						res.render('userlist', {
							"userlist" : docs,
							"title": "User List"
						});
					});
				}
				else
				{
					req.session.reset();
					res.redirect('/login');
				}

			}
		);
	}
	else
	{
		req.session.reset();
		res.redirect('/login');
	}
});

/* GET New User page. */
router.get('/newuser', function(req, res)
{
	var db = req.dbSchool;
	var collection = db.get('school');
	collection.find({},{},function(e,docs){
		res.render('newuser', { title: 'Add New User', "schools":docs });
	});
});

/* GET New POST page. */
router.get('/newpost', function(req, res)
{
	var db = req.dbSchool;
	var collection = db.get('school');
	if (req.session && req.session.user)
	{
		var query = collection.find({'username':req.session.user.username}).then(
			function(value)
			{
				if(value)
				{
					res.locals.user = value[0];
					collection.find({},{},function(e,docs){
						res.render('newpost', { title: 'Add New Post', "schools":docs, "user":req.session.user });
					});
				}
				else
				{
					req.session.reset();
					res.redirect('/login');
				}

			}
		);
	}
	else
	{
		req.session.reset();
		res.redirect('/login');
	}
});

/*POST to check login*/
router.post('/Ulogin', function(req, res)
{
	var db = req.dbUser;

	var uName = req.body.uusername;
	var uPass = req.body.upassword;

	var collection = db.get('user');

	var query = collection.find({'username':uName}).then(
		function(value)
		{
			if(value[0])
			{
				if (validatePassword(uPass, value[0].password))
				{
					//console.log("WELCOME YOU ARE LOGGED IN!");
					req.session.user = value[0];
					req.session.user.password = "";
					res.redirect("userlist");
				}
				else
				{
					//console.log("YOU ARE NOT LOGGED IN!");
					res.redirect("login?error=2");
				}
			}
			else
			{
				//console.log("ERROR: USER NOT FOUND!")
				res.redirect("login?error=2");
			}

		}
	);
});

router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('login');
});

router.post('/validateusername', function(req, res)
{
  // Set our internal DB variable
    var db = req.dbUser;
	// Set our collection
    var collection = db.get('user');

	var userName = req.body.username;

	var query = collection.find({'username':userName}).then(
		function(value)
		{
			if(value[0])
			{
				res.json({ "valid": false, "message":"Username already taken!" });
			}
			else
			{
				res.json({ "valid": true, "message":"Good" });
			}
		}
	);

});

router.post('/addpost', function(req, res)
{

	var feeddb = req.dbFeed;
	var schooldb = req.dbSchool;
	var feedcollection = feeddb.get('feed');
	var schoolcollection = schooldb.get('school');

	var driver = req.body.userID;
	var startLocation = req.body.start;
	var schoolObject;
	var endLoaction = req.body.end;
	var dateObject = new Date(req.body.date + " " + req.body.time);
	var cost = req.body.cost;
	var availableSeats = req.body.available;
	var postDescription = req.body.description;
	var query = schoolcollection.find({'_id':startLocation}).then(
		function(value)
		{
			if(value[0])
			{
        var campus = value[0].campus[0];
				// Submit to the DB
				feedcollection.insert({
					"driver" : driver,
					"start" : value[0],
          "address": campus.location.Address + "," + campus.location.City + "," + campus.location.Province + "," + campus.location.Country + "," + campus.location.Postal,
					"end" : endLoaction,
					"date" : dateObject,
					"cost" : cost,
					"filled" : 0,
					"available" : availableSeats,
					"description" : postDescription,
				}, function (err, doc) {
					if (err) {
						// If it failed, return error
						res.send("There was a problem adding the information to the database.");
					}
					else {
						// And forward to success page
						res.redirect("feed");
					}
				});
			}
		}
	);
});

/* POST to remove post Service */
router.get('/removepost/:postID', function(req, res)
{
  var db = req.dbFeed;
  var collection = db.get('feed');
	var postID = req.params.postID;
	collection.remove({"_id":postID }).then(function()
	{
		console.log ("Deleted: " + postID);
		res.redirect("/postlist");
	});
});

/* POST to Add User Service */
router.post('/adduser', function(req, res)
{

  // Set our internal DB variable
  var db = req.dbUser;

	// Set our collection
  var collection = db.get('user');

    // Get our form values. These rely on the "name" attributes
	var userFirstName = req.body.firstname;
	var userLastName = req.body.lastname;
  var userName = req.body.username;
  var userEmail = req.body.useremail;
	var userPassword = req.body.userpassword;
	var userPasswordConfirm = req.body.userpasswordconfirm;
	var userSchoolID = req.body.userschool;
	//Hash the password
	var Upass = saltAndHash(userPassword);
	// Submit to the DB
	collection.insert({
		"fname" : userFirstName,
		"lname" : userLastName,
		"username" : userName,
		"school": userSchoolID,
		"email" : userEmail,
		"password": Upass
	}, function (err, doc) {
		if (err) {
			// If it failed, return error
			res.send("There was a problem adding the information to the database.");
		}
		else {
			// And forward to success page
			res.redirect("login");
		}
	});
});

/* POST to remove user Service */
router.get('/removeuser/:userid', function(req, res)
{
  var db = req.dbUser;
  var collection = db.get('user');
	var userID = req.params.userid;
	collection.remove({"_id": userID}).then(function()
	{
		console.log ("Deleted: " + userID);
		res.redirect("/userlist");
	});
});

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 31; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
};

var hash = function(str)
{
	return crypto.createHash('sha256').update(str).digest('HEX');
};

var saltAndHash = function(pass)
{
	//"If I salt a password does that make it spicy?"
	var salt = generateSalt();
	return salt + hash(pass + salt) + hash(salt);
};

var validatePassword = function(plainPass, hashedPass)
{
	var salt = hashedPass.substr(0, 31);
	var validHash = salt + hash(plainPass + salt) + hash(salt);
	if (hashedPass === validHash)
	{
		return true;
	}
	else
	{
		return false;
	}
};

var validateToken = function(clientToken, serverToken)
{
	var salt = clientToken.substr(0, 31);
	var validToken = salt + hash(serverToken + salt) + hash(salt);
	if (clientToken === validToken)
	{
		return true;
	}
	else
	{
		return false;
	}
};

module.exports = router;
