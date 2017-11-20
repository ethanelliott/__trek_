var express = require('express');
var crypto = require('crypto');
var mongo = require('mongodb');
var session = require('client-sessions');
var numeral = require('numeral');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var reply = {
    "response": "OK",
    "data": null
  };
  res.json(reply);
});

/* POST to Add User Service */
router.post('/add/user', function(req, res)
{
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
    var reply;
		if (err) {
			//something went wrong...
			reply = {
        "response":"OK",
        "data": {
          "source":"add-user",
          "result":false
        }
      };
		}
		else {
			//success!
      reply = {
        "response":"OK",
        "data": {
          "type":"add-user",
          "result":true
        }
      };
		}
    res.json(reply);
	});
});

/*POST to check login*/
router.post('/Ulogin', function(req, res)
{
	var db = req.dbUser;
  var collection = db.get('user');

	var uName = req.body.uusername;
	var uPass = req.body.upassword;

	var query = collection.find({'username':uName}).then(
		function(value)
		{
      var reply;
			if(value[0])
			{
				if (validatePassword(uPass, value[0].password))
				{
					//console.log("WELCOME YOU ARE LOGGED IN!");
					req.session.user = value[0];
					req.session.user.password = "";
          reply = {
            "response":"OK",
            "data":{
              "type":"login",
              "result":true,
              "token":generateToken(value[0]._ID, value[0].username)
            }
          };
				}
				else
				{
					//console.log("YOU ARE NOT LOGGED IN!");
          reply = {
            "response":"OK",
            "data":{
              "type":"login",
              "result":false,
              "token":null
            }
          };
				}
			}
			else
			{
				//console.log("ERROR: USER NOT FOUND!")
        reply = {
          "response":"OK",
          "data":{
            "type":"login",
            "result":false,
            "token":null
          }
        };
			}
      res.json(reply);
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

var generateToken = function(UserID, userName)
{
  var salt = generateSalt();
  return salt + hash(UserID + salt) + UserID + hash(userName + salt);
};

var validateToken = function(clientToken, UserID, userName)
{
	var salt = clientToken.substr(0, 31);
	var validToken = salt + hash(UserID + salt) + UserID + hash(userName + salt);
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
