var gui = require('nw.gui');
var win = gui.Window.get();

var exec = require('child_process').exec;
var fs = require("fs");

var blog = "jasonsscreenshots.tumblr.com";

// Authenticate via OAuth
var tumblr = require('tumblr.js');

var config = JSON.parse(fs.readFileSync("config.json", "utf8"));

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
	title: 'S'
});

// Give it a menu.
var menu = new gui.Menu();
menu.append(new gui.MenuItem(
{
	label: 'Exit',
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
	exec('/usr/sbin/screencapture -i temp.png', function(error, stdout, stderr)
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
    
    var data = {"type": "photo", "data": "temp.png", "caption": caption};
    
    client.photo(blog, data, function (err, data) 
    {
        console.log(data);
    });
}

win.on('close', function() 
{
  win.hide();
  $("#caption").val("");
});