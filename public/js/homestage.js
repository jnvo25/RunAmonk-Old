import { Button } from "./button.js";
var player;
var cursors;
var playerGenerated;
var otherPlayers;
var chasers;
var runners;
var lastUpdated;
let spacebar;
var ladder;
var gameTime;
var gameover;
var allTagTimer;
var replay;
var exit;
var waiting;
var totalPlayers;
var readyPlayers;
var screenCenterX;
var screenCenterY;
var waitingStatus;
var gamestatus;
var screenText;

export class HomeStage extends Phaser.Scene {
    constructor() {
        super('HomeStage');
    }

    preload() {

        // Load Owlet assets
        this.load.spritesheet('owlet-idle', 'assets/Owlet_Monster/Owlet_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-run', 'assets/Owlet_Monster/Owlet_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-jump', 'assets/Owlet_Monster/Owlet_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-death', 'assets/Owlet_Monster/Owlet_Monster_Death_8.png', { frameWidth: 32, frameHeight: 32 });

        // Load Pinkie assets
        this.load.spritesheet('pinkie-idle', 'assets/Pink_Monster/Pink_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pinkie-run', 'assets/Pink_Monster/Pink_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pinkie-jump', 'assets/Pink_Monster/Pink_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pinkie-death', 'assets/Pink_Monster/Pink_Monster_Death_8.png', { frameWidth: 32, frameHeight: 32 });

        // Load  Monkee assets
        this.load.spritesheet('monkee-idle', 'assets/Monkee_Monster/Monkee_Monster_Idle_18.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('monkee-run', 'assets/Monkee_Monster/Monkee_Monster_Run_8.png', { frameWidth: 32, frameHeight: 32 });

        // Load stage assets
        this.load.image('background', 'assets/maps/images/background.png');
        this.load.image('ladder', '/assets/maps/tilesets/ladder.png');
        this.load.image('spike', 'assets/maps/images/spike.png');
        this.load.image('tiles', 'assets/maps/tilesets/terrain_tilesheet.png');
        this.load.tilemapTiledJSON('map', 'assets/maps/tilemaps/homestage.json');
    }

    create() {
        // Create stage
        const backgroundImage = this.add.image(0,0, 'background').setOrigin(0,0);
        backgroundImage.setScale(2, 0.8);

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('terrain_tilesheet', 'tiles');
        const platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
        platforms.setCollisionByExclusion(-1, true);

        // Add ladder
        ladder = this.add.image(400, 370,  'ladder');
        ladder.setScale(1,1.25);

        // Create animations
        this.createAnimation('owlet-idle', 3, true);
        this.createAnimation('owlet-run', 5, true);
        this.createAnimation('owlet-jump', 7, true);
        this.createAnimation('owlet-death', 7, false);

        this.createAnimation('pinkie-idle', 3, true);
        this.createAnimation('pinkie-run', 5, true);
        this.createAnimation('pinkie-jump', 7, true);
        this.createAnimation('pinkie-death', 7, false);

        this.createAnimation('monkee-idle', 17, true);
        this.createAnimation('monkee-run', 7, true);

        // Initialize helpers
        spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        lastUpdated = Date.now();
        allTagTimer = Date.now();
        gameover = false;
        screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        waitingStatus = new Set();
        gamestatus = "waiting";
        
        // Initialize cursors to take in user input in update()
        cursors = this.input.keyboard.createCursorKeys();
        
        // Create connection to server
        this.socket = io();
        var self = this;    // Sometimes sockets don't like "this" so define this outside and pass in
        otherPlayers = new Set();

        // Define game roles and implement overlap callback
        chasers = this.add.group();
        runners = this.add.group();
        self.physics.add.overlap(runners,chasers, (player1, player2) => {
            this.handleTag(runners.contains(player1) ? player1 : player2);
        });

        // Condition: When this client joins an active game
        // Parameter: Waiting room information (totalPlayers, readyPlayers, gamestatus)
        // Handling: Draw circles on screen according to how many players
        this.socket.on('currentPlayers', (roomInfo) => {    
            this.displayText("Waiting for players to ready")
            totalPlayers = roomInfo.totalPlayers;
            readyPlayers = roomInfo.readyPlayers
            this.updateWaitingRoom(self);
        })

        // Condition: Notification a player has been tagged by another player
        // Parameter: PlayerId
        // Handling: Check if its current player and play death animation accordingly
        this.socket.on('taggedPlayer', (tagData) => {
            if(player.playerId === tagData.playerId) {
                player.isTagged = true;
                player.anims.play(player.char + '-death');
            }
             else {
                otherPlayers.forEach(function (otherPlayer) {
                    if(otherPlayer.playerId === tagData.playerId) {
                        otherPlayer.anims.play(otherPlayer.char + '-death');
                    } 
                });
            }
        });

        // Condition: Notification a player has moved position
        // Parameter: Player's velocity, flip, and animation
        // Handling: Search for player and update
        this.socket.on('playerMoved', function (playerInfo) {
            otherPlayers.forEach(function (otherPlayer) {
                if(otherPlayer.playerId === playerInfo.playerId) {
                    otherPlayer.setVelocity(playerInfo.velX, playerInfo.velY);
                    otherPlayer.setFlipX(playerInfo.flip);
                    otherPlayer.anims.play(playerInfo.anim, true);
                }
            });
        });

        // Condition: Consistently triggers every 1 second of player no movement
        // Parameter: Player's x,y position
        // Handling: Search for player and update
        this.socket.on('updatePosition', function (playerInfo) {
            otherPlayers.forEach(function (otherPlayer) {
                if(otherPlayer.playerId === playerInfo.playerId) {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        // Condition: Notification a new player joined
        // Parameter: Total number of players
        // Handling: Add player to client's list
        this.socket.on('newPlayer', function (updatedTotal) {
            console.log("NEW PLAYER!", totalPlayers);
            totalPlayers = updatedTotal;
            self.updateWaitingRoom();
        });

        // Condition: Notification a player disconnected
        // Parameter: Total number of players
        // Handling: Total players in game
        this.socket.on('disconnectedPlayer', (updatedTotal) => {     
            console.log("DISCONNECTED PLAYER!", totalPlayers);
            totalPlayers = updatedTotal;
            self.updateWaitingRoom();
        })

        // Condition: Client notified all players are tagged
        // Parameter: None
        // Handling: End game and ask to replay
        this.socket.on('playersAllTagged', () =>{
            gamestatus = "gameover";
            this.displayText("Game Over");
            replay = new Button(screenCenterX, screenCenterY+50, 'Ready', this, () => {
                this.socket.emit('playerReady');
                player.destroy();
                Object.keys(otherPlayers).forEach((otherPlayer) => {
                    otherPlayer.destroy();
                })
            });
        })

        // Condition: Client sends when player is ready but there are other players not ready
        // Parameter: Number players not ready
        // Handling: Display correct colored circles
        this.socket.on('waitingUpdate', (playersNotReady) =>{
            console.log("PLAYERS NOT READY: ", playersNotReady);
            readyPlayers = totalPlayers - playersNotReady;
            this.updateWaitingRoom();
        })

        // Condition: Client sends when all players are ready
        // Parameter: None
        // Handling: 
        this.socket.on('allReady', (players) =>{
            console.log("All players are ready");
            this.removeText();
            totalPlayers = 0;
            Object.keys(players).forEach((id) => {
                totalPlayers++;
                if(players[id].playerId == self.socket.id) {
                    player = self.createPlayer(self, players[id]);
                    player.isChaser = players[id].isChaser;
                    self.physics.add.collider(player, platforms);
                    playerGenerated = true;
                } else {
                    if(!players[id].isTagged) {
                        var otherPlayer = self.createPlayer(self, players[id]);
                        self.physics.add.collider(otherPlayer, platforms);
                        otherPlayers.add(otherPlayer);
                    }
                }
            });
            console.log("DESTROY WAITING ROOM");
            this.destroyWaitingRoom();
            gamestatus = "playing";
        })

        // Display text countdown
        gameTime = 120;
        var text = this.add.text(738,35, gameTime, {color: "black"});
        countdown(this, text);

        // Display button
        replay = new Button(screenCenterX, screenCenterY+50, 'Ready', this, () => {
            this.socket.emit('playerReady');
        });
    }

    update() {
        if(gamestatus == "waiting") {
            
        } else if(gamestatus == "gameover") {
            
        } else if(gamestatus == "playing") {
            if(Date.now()-allTagTimer > 500) {
                allTagTimer = Date.now();
                this.socket.emit('checkAllTagged');
            }
            if(!player.isTagged) {
                // Player's current position
                const position = { 
                    x: player.x,
                    y: player.y,
                    velX: player.body.velocity.x,
                    velY: player.body.velocity.y,
                    flip: player.flipX,
                    anim: player.anims.getName()
                }

                // Allow climbing or jumping
                if (cursors.up.isDown || spacebar.isDown) {
                    if (checkOverlap(ladder, player)) {
                        player.setVelocityY(-100);
                        this.socket.emit('playerMovement', position);   // Climbing is weird and cannot be displayed with vector only
                    } else if(player.body.onFloor()) {
                        player.setVelocityY(-400);
                    }
                }
                
                // Allow movement right left and idle
                if (cursors.left.isDown) {
                    player.setVelocityX(-160);
                    player.setFlipX(true);
                    player.anims.play(player.char + '-run', true);
                } else if (cursors.right.isDown) {
                    player.setVelocityX(160);
                    player.setFlipX(false);
                    player.anims.play(player.char + '-run', true);
                } else {
                    player.setVelocityX(0);
                    player.anims.play(player.char + '-idle', true);
                }
                
                
                // If player position has updated, emit to other clients
                if(player.oldPosition && (player.body.velocity.x !== player.oldPosition.velX || player.body.velocity.y !== player.oldPosition.velY)) {
                    this.socket.emit('playerMovement', position);
                } else {
                    if(Date.now()-lastUpdated > 500) {
                        lastUpdated = Date.now();
                        this.socket.emit('positionUpdate', {
                            x: player.x,
                            y: player.y
                        });
                    }
                }

                // save old position
                player.oldPosition = position;
            }
        }
    }

    // HELPER FUNCTIONS
    // On tag, notify server of player's id and handle tagged player
    handleTag (taggedPlayer) {
        if(!taggedPlayer.isTagged) {
            this.socket.emit('tag', taggedPlayer.playerId);
            taggedPlayer.isTagged = true;
            taggedPlayer.anims.play(taggedPlayer.char + '-death');
            taggedPlayer.setVelocity(0, 0);
        }
    }

    // Add animation to phaser
    createAnimation(name, frames, repeat) {
        var config = {
            key: name,
            frames: this.anims.generateFrameNumbers(name, {start: 0, end: frames}),
            frameRate: 10
        };
        if (repeat) {
            config['repeat'] = -1;
        }
        this.anims.create(config);
    }

    // Create player object with physics
    createPlayer(self, playerInfo) {
        var temp = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.char + '-idle');
        temp.anims.play(playerInfo.char + '-idle', true);
        temp.playerId = playerInfo.playerId;
        temp.char = playerInfo.char;
        temp.setSize(14, 27);
        temp.setOffset(8, 5);
        temp.setCollideWorldBounds(true);
        temp.isTagged = false;
        if(playerInfo.isChaser) {
            chasers.add(temp);
        } else {
            runners.add(temp);
        }
        return temp;
    } 

    // Updates circles in waiting room
    updateWaitingRoom() {
        console.log("Updating to accomodate " + totalPlayers + " players");
        waitingStatus.forEach(function (circle) {
            circle.destroy();
        })
        for(var i=0; i<totalPlayers; i++) {
            if(i < readyPlayers) {
                waitingStatus.add(this.add.circle((screenCenterX-((totalPlayers-1)*50)/2)+i*50, screenCenterY-20, 15, 0x00bf19));
            } else {
                waitingStatus.add(this.add.circle((screenCenterX-((totalPlayers-1)*50)/2)+i*50, screenCenterY-20, 15, 0x575757));
            }
        }
    }

    // Destroys circle waiting room
    destroyWaitingRoom() {
        waitingStatus.forEach(function (circle) {
            circle.destroy();
        })
        replay.remove();
    }

    // Displays text on screen
    displayText(textInput) {
        if (screenText !== undefined) 
            this.removeText();
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        screenText = this.add.text(screenCenterX, screenCenterY-100, textInput, {backgroundColor: "#ffo", fontSize: "40px"}).setOrigin(0.5);
    }

    // Remove text on screen
    removeText() {
        screenText.destroy();
    }
    
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}



function countdown(scene, text) {
    scene.time.addEvent({
        delay: 1000,
        callback: () => {
            gameTime--;
            text.setText(gameTime);
            if(gameTime > 0 && !gameover)
                countdown(scene, text);
        }
    })
}