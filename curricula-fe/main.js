const { app, BrowserWindow, dialog } = require("electron");
const path = require("node:path");
const { spawn } = require("child_process");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let apiProcess;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    // If it failed to obtain the lock, you can assume that another instance of
    // your application is already running with the lock and exit immediately
    app.quit();
} else {
    app.on(
        "second-instance",
        (event, commandLine, workingDirectory, additionalData) => {
            // Someone tried to run a second instance, we should focus our window if it's minimized
            if (win) {
                if (win.isMinimized()) {
                    win.restore();
                    win.focus();
                }
            }
        }
    );
}

function createWindow() {
    if (require("electron-squirrel-startup")) app.quit();

    win = new BrowserWindow({
        width: 1200,
        height: 800,
        focusable: true,
        autoHideMenuBar: true,
        show: false,
    });
    win.loadFile("dist/curricula-page/browser/index.html");

    win.once("ready-to-show", () => {
        win.maximize();
    });

    win.on("close", (e) => {
        const choice = dialog.showMessageBoxSync(win, {
            type: "question",
            noLink: true,
            buttons: ["Si", "No"],
            title: "Pericolo",
            message: "Hai salvato?",
        });
        if (choice === 1) {
            e.preventDefault();
        }
    });

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once("ready", startServer);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    app.quit();
});

app.on("quit", () => {
    if (apiProcess) {
        apiProcess.kill();
    }
});

function startServer() {
    let apipath = path.join(/*process.resourcesPath, */ "Curricula.exe");

    // Spin up the exe or OSX excutable - self hosted x-plat .NET Core WebAPI
    apiProcess = spawn(apipath);

    // Create Window
    createWindow();
}
