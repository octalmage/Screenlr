var gui = require('nw.gui');
var win = gui.Window.get();

var exec = require('child_process').exec;
var fs = require("fs");

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
	title: 'Screenlr'
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
        uploadPhoto();
	});
});

//Take a screenshot using Mac's screencapture.
function screenshot()
{
	exec('/usr/sbin/screencapture -i temp.png', function(error, stdout, stderr)
	{
		console.log(stdout);
		console.log(error)
		if (error == null)
		{
			//$("#capture").css("background-image", "url('temp.png?" + new Date().getTime() + "')");
            $("#capture").attr("src", "temp.png?" + new Date().getTime());
		}
	});
}

//Upload the photo to Tumblr! 
function uploadPhoto()
{
    var data = {"type": "photo", "data": "temp.png"};
    
    client.photo("jasonport.tumblr.com", data, function (err, data) 
    {
        console.log(data);
    });
}