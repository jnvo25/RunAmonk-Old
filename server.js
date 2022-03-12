var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var players = {};
var owlets = 0;
var pinkies = 0;
io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // Generate owl data and send to client
  if (owlets > pinkies) {
    players[socket.id] = {
      x: 100,
      y: 300,
      char: 'pinkie',
      playerId: socket.id
    }
    pinkies++;
  } else {
    players[socket.id] = {
      x: 100,
      y: 300,
      char: 'owlet',
      playerId: socket.id
    }
    owlets++;
  }

  // Give current player list of active players
  socket.emit('currentPlayers', players);

  // Let everyone know new player has arrived
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});