var remote = require('remote');
var dialog = remote.require('dialog');


angular.module('2015-1510 - M - ENRICH GOAL: JAVASCRIPT SERVER SIDE RESEARCH', [])


/*The controllers*/
.controller('master', function master($scope) {
	m = $scope

	m.loading = true

	m.socket = io.connect(':59991');
	m.socket.emit('servers', true)
	m.socket.on('servers', function (data) {
		m.servers = data
	 	m.loading = false
	 	m.$applyAsync()
	});

	m.pickDirectory = function minimize (a) {
		return (dialog.showOpenDialog({ properties: [ 'openDirectory']}) || ['']) [0]
	}

	m.minimize = function minimize () {
		remote.getCurrentWindow().minimize()
	}

	m.edit = function edit (server) {
		m.socket.emit('edit server', server)
	}

	m.destroy = function destroy (server) {
		if (confirm('Are you sure you want to delete: `' + server.title + '`?')) m.socket.emit('destroy server', server)
	}

	m.create = function create (server) {
		delete server.new
		m.socket.emit('create server', server)
	}

	m.save = function save (server) {
		delete server.new
		m.socket.emit('save server', server)
	}

	m.toggle = function (server) {
		if (server.up) m.socket.emit('stop server', server)
		else m.socket.emit('start server', server)
	}

})

