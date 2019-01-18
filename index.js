// Modules to control application life and create native browser window
// $ const {app, BrowserWindow} = require('electron')
const electron = require('electron');
const url = require ('url');
const path = require('path');
const Tray = electron.Tray;
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let addWindow;

const mainMenuTemplate = [
{
	label:'File',
	submenu:[
	{
		label:'Add Item',
		accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
		click(){
			creatAddWindow();
		}
	},
	{
		label:'Clear Item',
		click(){
			mainWindow.webContents.send('item:clear');
		}
	},
	{
		label:'Quit',
		accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
		click(){
			app.quit();
		}
	}
	]
}
];

function createWindow () {
  // Create the browser window.
	mainWindow = new BrowserWindow({
		minWidth: 900,
		minHeight: 340,
		icon: 'img/logo.png',
		width: 900,
		height: 600,
		center: true,
	  })

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocal: 'file:',
		slashes: true
	}));

  // and load the index.html of the app.
  mainWindow.loadFile('mainWindow.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
	mainWindow.on('closed', function(){
			app.quit();
	});

	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Insert menu
	Menu.setApplicationMenu(mainMenu);

	const tray = new Tray('img/logo.png');

	tray.setToolTip('Bloc-Note');

	ipcMain.on('information-dialog-selection', function () {
		const option = {
			type: 'error',
			buttons: ['OK'],
			title: 'Attention !',
			message: 'Cette note est déjà enregistré sur le bureau.'
		};
		dialog.showMessageBox(null, option, (response) => {

		});
	})
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developper Tools',
		submenu:[
		{
			label: 'Toggle DevTools',
			accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
			click(item, focusedWindow){
				focusedWindow.toggleDevTools();
			}
		},
		{
			role: 'reload'
		}
		]
	});
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
