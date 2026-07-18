import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "Shyara Finance",
    // icon: path.join(__dirname, 'public/logo.ico'), // Add an .ico file later
    autoHideMenuBar: true, // Hides the typical file/edit/view browser menu
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // REPLACE THIS with your actual deployed Vercel URL
  mainWindow.loadURL('https://shyara-finance-dashboard.vercel.app');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});