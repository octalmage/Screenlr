var gui = require('nw.gui');
var win = gui.Window.get();

var exec = require('child_process').exec;

var nativeMenuBar = new gui.Menu({ type: "menubar" });
nativeMenuBar.createMacBuiltin("Screenlr");
win.menu = nativeMenuBar;

// Create a tray text
var tray = new gui.Tray({ title: 'Screenlr'});

// Give it a menu.
var menu = new gui.Menu();
menu.append(new gui.MenuItem({label: 'Exit', click: function() 
{
    gui.App.quit();
}, }));
tray.menu = menu;

//Hotkey
var option = 
{
  key : "Ctrl+Shift+T",
  active : function() 
  {
  	screenshot()
  },
  failed : function(msg) 
  {
    console.log(msg);
  }
};

var shortcut = new gui.Shortcut(option);

gui.App.registerGlobalHotKey(shortcut);

$(function()
{
    $("#submitButton").on("click", function submitClicked()
    {

    });
});

function screenshot()
{
	exec('/usr/sbin/screencapture -i temp.png', function(error, stdout, stderr) 
	{
		console.log(stdout);
		console.log(error)
    	if (error == null) 
    	{
        	$("#capture").css("background-image", "url('temp.png?" + new Date().getTime() + "')");
    	}
	});	
}
