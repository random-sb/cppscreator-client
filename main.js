const {
    app,
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain,
    nativeTheme
} = require('electron')

const DiscordRPC = require('discord-rpc');
let rpc

const {
    autoUpdater
} = require('electron-updater');
let updateAv = false;

const path = require('path')


let pluginName
switch (process.platform) {
case 'win32':
    switch (process.arch) {
    case 'ia32':
        pluginName = 'flash/pepflashplayer32_32_0_0_303.dll'
        break
    case 'x32':
        pluginName = 'flash/pepflashplayer32_32_0_0_303.dll'
        break
    case 'x64':
        pluginName = 'flash/pepflashplayer64_32_0_0_303.dll'
        break
    }
    break
case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin'
    break
case 'linux':
    pluginName = 'flash/libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

var win
var pro
app.on('ready', () => {
    createWindow();
})

//window creation function
function createWindow() {
    win = new BrowserWindow
    ({
    title: "CPPSCreator",
    webPreferences: {
        plugins: true,
        nodeIntegration: true
    },
    width: 1385,
    height: 840
    });
    makeMenu();
    activateRPC();
	
    win.loadURL('https://www.cppscreator.xyz/');
    autoUpdater.checkForUpdatesAndNotify();
    Menu.setApplicationMenu(fsmenu);
	
    win.on('closed', () => {
    	win = null;
    });
}

//prompt
function createPrompt() {
    pro = new BrowserWindow
    ({
	    title: "CPPSCreator",
	    webPreferences: {
		plugins: true,
		nodeIntegration: true
	    },
	    width: 470,
	    height: 122
    });
    makeMenu();
	
    pro.loadFile('turnIDtoURL.html');
}

// start of menubar part

const aboutMessage = `CPPSCreator v${app.getVersion()}
Created by Random with much code provided by Allinol for use with Coastal Freeze.`;


function activateRPC() { 
  const clientId = '793529837062193153'; 
  DiscordRPC.register(clientId);
  rpc = new DiscordRPC.Client({ transport: 'ipc' }); 
  const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: `www.cppscreator.xyz`, 
      state: `Browsing CPPSes`, 
      startTimestamp, 
      largeImageKey: `main-logo`
    });
  });
  rpc.login({ clientId }).catch();
}

function makeMenu() { // credits to random
    fsmenu = new Menu();
    if (process.platform == 'darwin') {
        fsmenu.append(new MenuItem({
            label: "CPPSCreator Client",
            submenu: [{
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["Ok"],
                            title: "About CPPSCreator",
                            message: aboutMessage
                        });
                    }
                },
                {
                    label: 'Fullscreen (Toggle)',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        win.setFullScreen(!win.isFullScreen());
                        win.webContents.send('fullscreen', win.isFullScreen());
                    }
                },
                {
                    label: 'Mute Audio (Toggle)',
                    click: () => {
                        win.webContents.audioMuted = !win.webContents.audioMuted;
                        win.webContents.send('muted', win.webContents.audioMuted);
                    }
                },
                {
                    label: 'Visit CPPS code...',
                    click: () => {
                        createPrompt();
                    }
                },
                {
                    label: 'Log Out',
                    click: () => {
                        clearCache();
                        win.loadURL('https://www.cppscreator.xyz/');
                    }
                }
            ]
        }));
    } else {
        fsmenu.append(new MenuItem({
            label: 'About',
            click: () => {
                dialog.showMessageBox({
                    type: "info",
                    buttons: ["Ok"],
                    title: "About CPPSCreator",
                    message: aboutMessage
                });
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Fullscreen (Toggle)',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
                win.setFullScreen(!win.isFullScreen());
                win.webContents.send('fullscreen', win.isFullScreen());
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Mute Audio (Toggle)',
            click: () => {
                win.webContents.audioMuted = !win.webContents.audioMuted;
                win.webContents.send('muted', win.webContents.audioMuted);
            }
        }));
	fsmenu.append(new MenuItem({
            label: 'Visit CPPS code...',
            click: () => {
                createPrompt();
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Log Out',
            click: () => {
                clearCache();
                win.loadURL('https://www.cppscreator.xyz/');
            }
        }));
    }
}

function clearCache() {
    windows = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearCache(() => {});
}

ipcMain.on('cpps_code', (event, cppsCode) => {
    win.loadURL("https://play.cppscreator.xyz/embed/" + cppsCode);
    pro.close();
    pro = null;
    const startTimestamp = new Date();
    rpc.setActivity({
        details: `www.cppscreator.xyz`, 
        state: `Playing CPPS ID: ` + cppsCode, 
        startTimestamp, 
        largeImageKey: `main-logo`
    });
});

// end of menubar

//Auto update part

autoUpdater.on('update-available', (updateInfo) => {
	updateAv = true;
	
	switch (process.platform) {
	case 'win32':
	    dialog.showMessageBox({
		  type: "info",
		  buttons: ["Ok"],
		  title: "Update Available",
		  message: "There is a new version available (v" + updateInfo.version + "). It will be installed when the app closes."
	    });
	    break
	case 'darwin':
	    dialog.showMessageBox({
		  type: "info",
		  buttons: ["Ok"],
		  title: "Update Available",
		  message: "There is a new version available (v" + updateInfo.version + "). Please go install it manually from the website."
	    });
	    break
	case 'linux':
	    dialog.showMessageBox({
		  type: "info",
		  buttons: ["Ok"],
		  title: "Update Available",
		  message: "There is a new version available (v" + updateInfo.version + "). Auto-update has not been tested on this OS, so if after relaunching app this appears again, please go install it manually."
	    });
	    break
	}
    //win.webContents.send('update_available', updateInfo.version);
});

/*
autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', {
        version: app.getVersion()
    });
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

// end of Auto update part*/

app.on('window-all-closed', () => {
    if (updateAv) {autoUpdater.quitAndInstall();}
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
  if (win === null) {createWindow();}
});
