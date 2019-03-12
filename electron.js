const defaultMenu = require('electron-default-menu');
const { Menu, app, shell, BrowserWindow } = require('electron');

let electronWindow;
const createElectronWindow = () => {
	electronWindow = new BrowserWindow({
		width: 1366,
		height: 768,
		minWidth: 1220,
		minHeight: 686,
		webPreferences: {
			experimentalFeatures: true
		}
	});
	
	electronWindow.loadFile("./dist/index.html");
	
	if (process.env.npm_config_dev !== undefined) {
		electronWindow.webContents.openDevTools();
	}
	
	electronWindow.on("closed", () => {
		electronWindow = null;
	});
	
	const menu = defaultMenu(app, shell);
	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

app.on("ready", createElectronWindow);

app.on("window-all-closed", () => {
	app.quit();
});

app.on("activate", () => {
	if (!electronWindow) {
		createElectronWindow();
	}
});