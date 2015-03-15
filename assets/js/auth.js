var express = require("express");
var oauth = require("oauth");
var http = require("http");
var tumblr = require("tumblr.js");
var bodyParser = require("body-parser");
var methodoverride = require("method-override");
var errorhandler = require("errorhandler");

var server;
var auth_win;

var app = express();

app.set("port", 3001);
app.use(bodyParser.urlencoded(
{
	extended: true
}));
app.use(methodoverride());
app.use(errorhandler());

//Opens a window to give Screenlr access to Tumblr.
module.exports.init = function(done)
{
	var consumer = new oauth.OAuth(
		"http://www.tumblr.com/oauth/request_token",
		"http://www.tumblr.com/oauth/access_token",
		global.config.consumer_key,
		global.config.consumer_secret,
		"1.0A",
		"http://localhost:3001/auth/callback",
		"HMAC-SHA1"
	);
    
    //Redirects to Tumblr. 
	app.get("/auth/request", function(req, res)
	{
		consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret)
		{
			if (error)
			{
				res.status(500).send("Error getting OAuth request token: " + error);
			}
			else
			{
				oauthRequestToken = oauthToken;
				oauthRequestTokenSecret = oauthTokenSecret;

				res.redirect("http://www.tumblr.com/oauth/authorize?oauth_token=" + oauthRequestToken);
			}
		});
	});

    //Return from Tumblr with OAuth token.
	app.get("/auth/callback", function(req, res)
	{
		consumer.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, req.query.oauth_verifier, function(error, _oauthAccessToken, _oauthAccessTokenSecret)
		{
			if (error)
			{
				res.status(500).send("Error getting OAuth access token: " + error);
			}
			else
			{
                //Save returned OAuth tokens to global config object.
				global.config.token = _oauthAccessToken;
				global.config.token_secret = _oauthAccessTokenSecret;

                //Close OAuth window. 
				auth_win.close();
                
                //Close express server. 
				server.close();
                
                //Return to main app.
				done();
                
                return;
			}
		});
	});

	server = http.createServer(app);
	server.listen(app.get("port"), function()
	{
		console.log("Express server listening on port " + app.get("port"));

        //Launch new window. 
		auth_win = gui.Window.open("http://127.0.0.1:3001/auth/request");
	});
}