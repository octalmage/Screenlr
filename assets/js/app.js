var gui = require("nw.gui");
var win = gui.Window.get();
var clipboard = gui.Clipboard.get();

var exec = require("child_process").exec;
var fs = require("fs");

var blog = "jasonsscreenshots.tumblr.com";
var urltype = "post";
var notificationtext;

if (urltype == "image")
    notificationtext = "Image url copied to your clipboard."
else
    notificationtext = "Post url copied to your clipboard."

var request = require("request");
// Authenticate via OAuth
var tumblr = require("tumblr.js");

global.config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var options = {
  body: notificationtext
};

var client = tumblr.createClient(
{
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  token: config.token,
  token_secret: config.token_secret
});

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

$(function()
{
	$("#submitButton").on("click", function()
	{
        win.hide();
        uploadPhoto();
	});
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