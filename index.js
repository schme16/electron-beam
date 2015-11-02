var app = require('app'),
    BrowserWindow = require('browser-window'),
    express = require('express'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    fork = require('child_process').fork,
    eApp = express(),
    server = require('http').Server(eApp),
    io = require('socket.io')(server),
    mainWindow = null,
    port = 59991,
    emit = true,
    servers = {},
    processes = {},
    pos = {},
    basePath = (fs.existsSync(app.getAppPath() + '/app.asar') ? app.getAppPath() + '/asar.app' : app.getAppPath())
    appIcon = null,
    Menu = require('menu'),
    updater = require('electron-updater'),
    Tray = require('tray'),
    saveServers = function () {
        fs.writeFile(app.getPath('userData') + '/servers.json', JSON.stringify(servers))
    },
    loadServers = function () {
        try {
            servers = JSON.parse(fs.readFileSync(app.getPath('userData') + '/servers.json'))
            for (var i in servers) {
                if (servers[i].up) startServer(servers[i].port, servers[i].directory, servers[i].title, servers[i].id)
            }
        }
        catch (e) {}
    },
    startServer = function (port, directory, title, id) {
        var id = id || uuid.v1()
        if (processes[id]) stopServer(id)
        if (!servers[id]) servers[id] = {
            id: id,
            title: title,
            port: port,
            directory: directory,
        }
        servers[id].up = true


        processes[id] = fork(basePath + '/web-server.js', [servers[id].port, servers[id].directory])
        processes[id]
            .on('error', function () {
                try {
                    stopServer()
                    servers[id].up = false
                } catch (e) {}
                emit = true
            })
            .on('close', function () {
                try {
                    delete processes[id]
                    servers[id].up = false
                } catch (e) {}
                emit = true
            })
            emit = true
            return id
    },
    stopServer = function (id) {
        if (processes[id]) {
            processes[id].kill()
            delete processes[id]
        }
        if (servers[id]) servers[id].up = false
        emit = true
    },
    destroyServer = function (id) {
        if (processes[id]) {
            processes[id].stdin.pause()
            processes[id].process.kill()
        }
        delete processes[id]
        delete servers[id]
        emit = true
    },


app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

eApp
    .use(require('cors')())
    .use(require('compression')())
    .use('/', express.static(basePath + '/sys'))

/**
 * @param {browser-window} win, target window to send console log message two.
 * @param {String} msg, the message we are sending.
 */
console.send = function(win, msg) {
    win.webContents.on('did-finish-load', function() {
        win.webContents.send('send-console', msg);
    });
}

loadServers()
server.on('error', function (err, data) {
    console.log(err, data)
})
server.listen(port, null, function () {

    try {
        pos = JSON.parse(fs.readFileSync(app.getPath('userData') + '/init.json'))
    }
    catch (e) {}


    app.on('ready', function() {
      
        require('crash-reporter').start()
        
        mainWindow = new BrowserWindow({width: 320, height: 480, frame: false, resizable : false, x: pos.x, y: pos.y,  'skip-taskbar': true})
        


        io.on('connection', function (socket) {


            socket.emit('servers', servers)

            setInterval(function (argument) {
                if (!emit) return
                emit = false
                socket.emit('servers', servers)
                saveServers()
            }, 100)

            socket.on('create server', function (data) {
                startServer(data.port, data.directory, data.title)
                emit = true
            })

            socket.on('start server', function (data) {
                if (data.id && servers[data.id]) startServer(null, null, null, data.id)
                emit = true
            })

            socket.on('stop server', function (data) {
                stopServer(data.id)
                emit = true
            })

            socket.on('save server', function (data) {
                if (data.id && servers[data.id]) servers[data.id] = data
                if (servers[data.id].up)  {
                    stopServer(data.id)
                    setTimeout(function () {
                        startServer(null, null, null, data.id)
                        emit = true
                    }, 100)
                }
                emit = true
            })

            socket.on('destroy server', function (data) {
                stopServer(data.id)
                destroyServer(data.id)
                emit = true
            })
        })

        appIcon = new Tray(basePath + '/sys/img/icons/apple-touch-icon.png')

        //contextMenu = Menu.buildFromTemplate((servers.length ? servers : [ { label: 'No servers', type: 'normal'}]))

        appIcon.setToolTip('electron Beam')

        //appIcon.setContextMenu(contextMenu)


        appIcon.on('double-clicked', function () {
            mainWindow.restore()
            mainWindow.focus()
        })

        mainWindow.on("move", function () {
            var data = {
                x: mainWindow.getPosition()[0],
                y: mainWindow.getPosition()[1]
            }

            fs.writeFileSync(app.getPath('userData') + '/init.json', JSON.stringify(data))
        })

        mainWindow.loadUrl('http://127.0.0.1:59991', null, function() {})


        /*

            updater.on('updateRequired', function () {        
                app.quit();
            })

            updater.on('updateAvailable', function () {
                mainWindow.webContents.send('update-available');
            })

            updater.start()

        */


    });
})

