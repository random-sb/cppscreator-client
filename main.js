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

/*const {
    autoUpdater
} = require('electron-updater');*/

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
    /*ipcMain.on('load:data', (event, mute, theme) => {
        muted = (mute == 'true');
		console.log(muted, typeof(muted))
        nativeTheme.themeSource = theme;
        win.webContents.audioMuted = muted;
    });*/
    activateRPC();
	
    win.loadURL('https://www.cppscreator.xyz/');
    //autoUpdater.checkForUpdatesAndNotify();
    Menu.setApplicationMenu(fsmenu);
}

//promopt
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

const aboutMessage = `CPPS Creator Client v${app.getVersion()}
Created by Random with much code provided by Allinol for use with Coastal Freeze.`;


function activateRPC() { 
  const clientId = '793529837062193153'; 
  DiscordRPC.register(clientId);
  const rpc = new DiscordRPC.Client({ transport: 'ipc' }); 
  const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: `cppscreator.xyz Desktop Client`, 
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
            label: "Coastal Freeze Client",
            submenu: [{
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: "info",
                            buttons: ["Ok"],
                            title: "About Coastal Freeze",
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
                    label: 'Dark Mode (Toggle)',
                    click: () => {
                        darkMode()
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
                        win.loadFile('index.html');
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
                    title: "About Coastal Freeze",
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
            label: 'Dark Mode (Toggle)',
            click: () => {
                darkMode()
            }
        }));
        fsmenu.append(new MenuItem({
            label: 'Log Out',
            click: () => {
                clearCache();
                win.loadFile('index.html');
            }
        }));
    }
}

function clearCache() {
    windows = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearCache(() => {});
}

function darkMode() {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
    } else {
        nativeTheme.themeSource = 'dark'
    }
    win.webContents.send('theme', nativeTheme.themeSource);
    return nativeTheme.shouldUseDarkColors
}



ipcMain.on('cpps_code', (event, cppsCode) => {
    win.loadURL("https://play.cppscreator.xyz/embed/" + cppsCode);
    pro.close();
    pro = null;
    const startTimestamp = new Date();
    rpc.setActivity({
        details: `cppscreator.xyz Desktop Client`, 
        state: `Playing CPPS ID: ` + cppsCode, 
        startTimestamp, 
        largeImageKey: `main-logo`
      });
});

function getEmbedURL(code) {
    return "https://play.cppscreator.xyz/embed/" + code;
}

// end of menubar

/* Auto update part

autoUpdater.on('update-available', (updateInfo) => {
    win.webContents.send('update_available', updateInfo.version);
});

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
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
  if (win === null) {createWindow();}
});