const { app, BrowserWindow } = require('electron');

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
	
	if (process.env.NODE_ENV !== "production") {
		electronWindow.webContents.openDevTools();
	}
	
	electronWindow.on("closed", () => {
		electronWindow = null;
	});
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