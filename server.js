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
var runnerScore = 0;
var taggerScore = 0;
io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // Generate owl data and send to client
  if (owlets > pinkies) {
    players[socket.id] = {
      // x: 700,
      // y: 300,
      x: 200,
      y: 300,
      char: 'pinkie',
      isChaser: true,
      playerId: socket.id
    }
    pinkies++;
  } else {
    players[socket.id] = {
      x: 100,
      y: 300,
      char: 'owlet',
      isChaser: false,
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
    players[socket.id].velX = movementData.velX;
    players[socket.id].velY = movementData.velY;
    players[socket.id].flip = movementData.flip;
    players[socket.id].anim = movementData.anim;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('tag', (playerId) => {
    taggerScore += 5;
    io.emit('taggedPlayer', {
      playerId: playerId,
      taggerScore: taggerScore
    });
  })

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    if (players[socket.id].char == "pinkie") 
      pinkies--;
    else
      owlets--;
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnectedPlayer', socket.id);
  });

});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});