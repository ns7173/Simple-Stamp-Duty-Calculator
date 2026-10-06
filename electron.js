const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const DEV_SERVER_URL = 'http://localhost:3000';

function getBuildIndexPath() {
  return path.join(__dirname, 'dist', 'index.html');
}

function showFallbackPage(mainWindow, message) {
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Stamp Duty Calculator</title>
        <style>
          html, body {
            margin: 0;
            height: 100%;
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            color: #0f172a;
          }
          body {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .panel {
            max-width: 560px;
            background: white;
            border: 1px solid #dbe2ec;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            padding: 24px 28px;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 24px;
          }
          p {
            margin: 0;
            line-height: 1.6;
          }
          code {
            background: #eef2ff;
            border-radius: 6px;
            padding: 2px 6px;
          }
        </style>
      </head>
      <body>
        <div class="panel">
          <h1>Stamp Duty Calculator</h1>
          <p>${message}</p>
        </div>
      </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    title: 'Stamp Duty & Registration Fees Calculator',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const buildIndexPath = getBuildIndexPath();

  if (fs.existsSync(buildIndexPath)) {
    mainWindow.loadFile(buildIndexPath);
    return;
  }

  mainWindow
    .loadURL(DEV_SERVER_URL)
    .catch(() => {
      showFallbackPage(
        mainWindow,
        'The app build is not ready yet. Please run <code>npm install</code> and <code>npm run build</code>, or start the Vite dev server with <code>npm run dev</code> before launching the app.'
      );
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
