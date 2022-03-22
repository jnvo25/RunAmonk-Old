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
var gamestatus = "waiting";
io.on('connection', function (socket) {
  players[socket.id] = {playerId: socket.id}  
  
  // Give player number of players and how many players ready
  totalPlayers = Object.keys(players).length;
  var readyPlayers = 0;
  for(const [key, value] of Object.entries(players)) {
    if (value.ready) readyPlayers++;
  }
  socket.emit('currentPlayers', {
    gamestatus: gamestatus,
    totalPlayers: totalPlayers,
    readyPlayers: readyPlayers
  });

  // Let everyone know new player has arrived
  socket.broadcast.emit('newPlayer', totalPlayers);

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

    delete players[socket.id];
    totalPlayers = Object.keys(players).length;
    
    // emit a message to all players to remove this player
    io.emit('disconnectedPlayer', totalPlayers);
  });

  // Cycle through all players to check if everyone is tagged
  socket.on('checkAllTagged', function () {
    var untaggedPlayerExists = false;
    for(const [key, value] of Object.entries(players)) {
      if(!value.isChaser && !value.isTagged) {
        untaggedPlayerExists = true;    
      }
    }
    if(!untaggedPlayerExists) {
      gameover();
    }
  })

  // Set current player as ready and send start game if all players are ready
  socket.on('playerReady', function () {
    players[socket.id].ready = true;
    var playersNotReadyCount = 0;
    for(const [key, value] of Object.entries(players)) {
      if(!value.ready) {
        playersNotReadyCount++;    
      }
    }
    if(playersNotReadyCount == 0) {
      io.emit('allReady', generatePlayers());
    } else {
      io.emit('waitingUpdate', playersNotReadyCount);
    }
  });

});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

function gameover() {
  readyPlayers = 0;
  for(key of Object.keys(players)) {
    players[key].ready = false;
  }
  io.emit('playersAllTagged');
}

function generatePlayers() {
  owlets = 0;
  pinkies = 0;
  monkees = 0;
  for(key of Object.keys(players)) {
    // Generate owl data and send to client
    if (monkees === 0) {
      players[key] = {
        ...players[key],
        x: 400,
        y: 400,
        char: 'monkee',
        isChaser: true,
      }
      monkees++;
    } else if (owlets > pinkies) {
      players[key] = {
        ...players[key],
        x: 700,
        y: 300,
        char: 'pinkie',
        isChaser: false,
      }
      pinkies++;
    } else {
      players[key] = {
        ...players[key],
        x: 100,
        y: 300,
        char: 'owlet',
        isChaser: false,
      }
      owlets++;
    }

    players[key].isTagged = false;
  }
  gamestatus = "playing";
  return players;
}