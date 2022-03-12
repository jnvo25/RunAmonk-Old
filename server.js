var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var players = {};
io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // Generate owl data and send to client
  players[socket.id] = {
    x: 100,
    y: 300,
    char: 'owlet',
    playerId: socket.id
  }
  socket.emit('currentPlayers', players);

});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});