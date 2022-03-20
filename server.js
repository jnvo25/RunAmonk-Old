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
var monkees = 0;
var runnerScore = 0;
var taggerScore = 0;
io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);

  // Generate owl data and send to client
  if (monkees === 0) {
    players[socket.id] = {
      x: 400,
      y: 400,
      char: 'monkee',
      isChaser: true,
      isTagged: false,
      playerId: socket.id
    }
    monkees++;
  } else if (owlets > pinkies) {
    players[socket.id] = {
      x: 700,
      y: 300,
      char: 'pinkie',
      isChaser: false,
      isTagged: false,
      playerId: socket.id
    }
    pinkies++;
  } else {
    players[socket.id] = {
      x: 100,
      y: 300,
      char: 'owlet',
      isChaser: false,
      isTagged: false,
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
    socket.broadcast.emit('playerMoved', {
      playerId: socket.id,
      velX: players[socket.id].velX,
      velY: players[socket.id].velY,
      flip: players[socket.id].flip,
      anim: players[socket.id].anim
    });
  });

  socket.on('positionUpdate', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit('updatePosition', {
      playerId: socket.id,
      x: movementData.x,
      y: movementData.y
    });
  })

  socket.on('tag', (playerId) => {
    taggerScore += 5;
    players[playerId].isTagged = true;
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
    else if(players[socket.id].char == "owlet")
      owlets--;
    else 
      monkees--;
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnectedPlayer', socket.id);
  });

  socket.on('checkAllTagged', function () {
    var untaggedPlayerExists = false;
    for(const [key, value] of Object.entries(players)) {
      if(!value.isChaser && !value.isTagged) {
        untaggedPlayerExists = true;    
      }
    }
    if(!untaggedPlayerExists) {
      io.emit('playersAllTagged');
    }
  })

});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});