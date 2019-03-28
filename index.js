const electron = require('electron');
const url = require ('url');
const path = require('path');
const Tray = electron.Tray;
const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

let mainWindow;
let addWindow;
// Lister for the App to be ready

app.on('ready', function(){
	// Create a new window
	mainWindow = new BrowserWindow({
		minWidth: 900,
		minHeight: 340,
		icon: 'img/logo.png',
		width: 900,
		height: 600,
		center: true
	  });

	// Load html file into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocal: 'file:',
		slashes: true
	}));

	//Quit App whe closed
	mainWindow.on('closed', function(){
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Insert menu
	Menu.setApplicationMenu(mainMenu);


    const tray = new Tray('img/logo.png');
    // Petit bonus : on affiche une bulle au survol.
    tray.setToolTip('Bloc-Note');
	// Notre fichier continue avec l’initialisation de la fenêtre, etc.
	

	// Throw an error message
	ipcMain.on('information-dialog-selection', function () {
		const option = {
			type: 'error',
			buttons: ['OK'],
			title: 'Attention !',
			message: 'Cette note est déjà enregistré sur le bureau.'
		};
		dialog.showMessageBox(null, option, (response) => {

		});
	});
	ipcMain.on('reload', function(){ // Reload App
		mainWindow.reload();
	});
});


// Handle creat add window

function creatAddWindow(){
	// Create a new window
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add Shopping List Item'
	});
	// Load html file into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocal: 'file:',
		slashes: true
	}));
	// Garbage collection handle
	addWindow.on('close', function(){
		addWindow = null;
	})
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
	mainWindow.webContents.send('item:add', item);
	//addWindow.close();	
});	

ipcMain.on('quit', function(){ // quit the App
	app.quit();
});


// Create menu template

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

// If mac, add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

// Add developper tools item if not in prod
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