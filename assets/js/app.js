//Main source file.

var gui = require("nw.gui");
var exec = require("child_process").exec;
var fs = require("fs");
var request = require("request");
var tumblr = require("tumblr.js");

var auth = require("./assets/js/auth.js")

//Global variables. 
global.gui = gui;
global.config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var win = gui.Window.get();
var clipboard = gui.Clipboard.get();
var blog = "jasonsscreenshots.tumblr.com";
var urltype = "post";
var notificationtext;
var client;

//Set notification text based on URL type.
if (urltype == "image")
    notificationtext = "Image url copied to your clipboard."
else
    notificationtext = "Post url copied to your clipboard."

//Open database for app settings.
var db = new PouchDB("settings");

//Load OAuth token and secret.
db.get("oauth", function(err, doc) 
{
    //Token not in database. 
    if (err) 
    { 
        //Start OAuth authentication procss. 
        auth.init(function()
        {
            //Store OAuth token in database.
            db.put({
                _id: "oauth",
                token: global.config.token,
                token_secret: global.config.token_secret
            });
            setup();
        });
        return;
    }
    
    //Load OAuth token from database into memory.
    global.config.token = doc.token;
    global.config.token_secret = doc.token_secret;
    setup();
});

var options = {
  body: notificationtext
};

var nativeMenuBar = new gui.Menu(
{
	type: "menubar"
});
nativeMenuBar.createMacBuiltin("Screenlr");
win.menu = nativeMenuBar;

// Create a tray text
var tray = new gui.Tray(
{
	title: "S"
});

// Give it a menu.
var menu = new gui.Menu();
menu.append(new gui.MenuItem(
{
	label: "Exit",
	click: function()
	{
		gui.App.quit();
	},
}));
tray.menu = menu;

$(function()
{
	$("#submitButton").on("mousedown", function()
	{
        win.hide();
        uploadPhoto();
	});
    
    $("#cancelButton").on("mousedown", function()
    {
        closeGUI();
    })
});

//Take a screenshot using Mac's screencapture.
function screenshot()
{
	exec("/usr/sbin/screencapture -i temp.png", function(error, stdout, stderr)
	{
		if (error == null)
		{
            win.show();
            $("#capture").attr("src", "temp.png?" + new Date().getTime());
		}
	});
}

//Upload the photo to Tumblr! 
function uploadPhoto()
{
    var caption = $("#caption").val();
    $("#caption").val("");
    
    if (caption)
    {
        var data = {"type": "photo", "data": "temp.png", "caption": caption};    
    }
    else
    {
        var data = {"type": "photo", "data": "temp.png"}; 
    }
    
    client.photo(blog, data, function (err, data) 
    {
        console.log(data);
        if (urltype == "image")
        {
            url = "http://" + blog + "/api/read/json?type=photo&num=1";
            request(url, function (error, response, body) 
            {
                if (!error && response.statusCode == 200) 
                {
                    var match = /1280\":\"(.*)\",\"photo-url-500/.exec(body);
                    var imageurl = match[1].replace(/\\/g, "");
                    clipboard.set(imageurl);
                    var notification = new Notification("Screenlr",options); 
                }
            });
        }
        else 
        {
            clipboard.set("http://" + blog + "/" + data.id, "text");
            var notification = new Notification("Screenlr",options);    
        }
    });
}

win.on("close", function() 
{
  win.hide();
  $("#caption").val("");
});

//Configure Tumblr authentication and hotkey. 
function setup()
{
    client = tumblr.createClient(
    {
        consumer_key: global.config.consumer_key,
        consumer_secret: global.config.consumer_secret,
        token: global.config.token,
        token_secret: global.config.token_secret
    });
    
    //Hotkey
    var option = {
    	key: "Ctrl+Shift+T",
    	active: function()
    	{
    		screenshot()
    	},
    	failed: function(msg)
    	{
    		console.log(msg);
    	}
    };

    var shortcut = new gui.Shortcut(option);

    gui.App.registerGlobalHotKey(shortcut);
}