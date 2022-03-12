var player;
var player2;
var playerScore;
var player2Score;
var p1text;
var p2text;
var cursors;
var gameStarted;
var playerGenerated;
var otherPlayers;
var taggers;
var runners;

export class HomeStage extends Phaser.Scene {
    constructor() {
        super('HomeStage');
    }

    preload() {

        // Player 1 assets
        this.load.spritesheet('owlet-idle', 'assets/Owlet_Monster/Owlet_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-run', 'assets/Owlet_Monster/Owlet_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-jump', 'assets/Owlet_Monster/Owlet_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-death', 'assets/Owlet_Monster/Owlet_Monster_Death_8.png', { frameWidth: 32, frameHeight: 32 });

        // Player 2 assets
        this.load.spritesheet('pinkie-idle', 'assets/Pink_Monster/Pink_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pinkie-run', 'assets/Pink_Monster/Pink_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pinkie-jump', 'assets/Pink_Monster/Pink_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });

        this.load.image('background', 'assets/maps/images/background.png');
        this.load.image('spike', 'assets/maps/images/spike.png');
        this.load.image('tiles', 'assets/maps/tilesets/terrain_tilesheet.png');
        this.load.tilemapTiledJSON('map', 'assets/maps/tilemaps/homestage.json');
    }

    create() {
        console.log("V1.0");
        const backgroundImage = this.add.image(0,0, 'background').setOrigin(0,0);
        backgroundImage.setScale(2, 0.8);

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('terrain_tilesheet', 'tiles');
        const platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
        platforms.setCollisionByExclusion(-1, true);

        this.anims.create({
            key: 'owlet-idle',
            frames: this.anims.generateFrameNumbers('owlet-idle', {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'owlet-run',
            frames: this.anims.generateFrameNumbers('owlet-run', {start: 0, end: 6}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'owlet-jump',
            frames: this.anims.generateFrameNumbers('owlet-jump', {start: 0, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'owlet-death',
            frames: this.anims.generateFrameNumbers('owlet-death', {start: 0, end: 8}),
            frameRate: 10
        });

        this.anims.create({
            key: 'pinkie-idle',
            frames: this.anims.generateFrameNumbers('pinkie-idle', {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'pinkie-run',
            frames: this.anims.generateFrameNumbers('pinkie-run', {start: 0, end: 6}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'pinkie-jump',
            frames: this.anims.generateFrameNumbers('pinkie-jump', {start: 0, end: 8}),
            frameRate: 10,
            repeat: -1
        })

        cursors = this.input.keyboard.createCursorKeys();


        // Print instructions onto screen
        gameStarted = false;
        displayText(this, "Welcome to 40521 the Game", 3, ()=> {
            displayText(this, "You have 2 minutes to tag the other player", 3, ()=> {
                displayText(this, "We will now select a player to be it", 3, ()=> {
                    displayText(this, "Pinkie is it!", 3, ()=> {
                        displayText(this, "Game starting in 3...", 1, ()=> {
                            displayText(this, "Game starting in 2...", 1, ()=> {
                                displayText(this, "Game starting in 1...", 1, ()=> {
                                    gameStarted = true;
                                })
                            })
                        })
                    })
                })
            })
        })

        

        playerScore = 0;
        player2Score = 0;

        p1text = this.add.text(10, 10, "Player 1: " + playerScore, {backgroundColor: "#ffo"});
        p2text = this.add.text(10, 30, "Player 2: " + player2Score, {backgroundColor: "#ffo"});

        var self = this;
        this.socket = io();
        otherPlayers = new Set();

        // Create players
        
        playerGenerated = false;
        taggers = this.add.group();
        runners = this.add.group();
        self.physics.add.overlap(runners,taggers, (player1, player2) => {
            // console.log(taggers.contains(player1));
            console.log(player1.playerId);
            this.handleTag(runners.contains(player1) ? player1 : player2);
            playerGenerated = true;
        });

        this.socket.on('currentPlayers', (players) => {    
            Object.keys(players).forEach((id) => {
                if(players[id].playerId == self.socket.id) {
                    player = self.createPlayer(self, players[id]);
                    self.physics.add.collider(player, platforms);
                    playerGenerated = true;
                } else {
                    var otherPlayer = self.createPlayer(self, players[id]);
                    self.physics.add.collider(otherPlayer, platforms);
                    otherPlayers.add(otherPlayer);
                }
            });
        })

        this.socket.on('taggedPlayer', (tagData) => {
            console.log(tagData)
            console.log(player.playerId, tagData.playerId);
            if(player.playerId === tagData.playerId) {
                console.log("I die")
                player.tagged = true;
                player.anims.play('owlet-death');
            }
             else {
                 otherPlayers.forEach(function (otherPlayer) {
                if(otherPlayer.playerId === tagData.playerId) {
                    otherPlayer.anims.play('owlet-death');
                } 
            });
        }
        });

        this.socket.on('disconnectedPlayer', (playerId) => {            
            otherPlayers.forEach(function (otherPlayer) {
                if(otherPlayer.playerId === playerId) {
                    otherPlayer.destroy();
                }
            });
        })

        this.socket.on('playerMoved', function (playerInfo) {
            otherPlayers.forEach(function (otherPlayer) {
                if(otherPlayer.playerId === playerInfo.playerId) {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    otherPlayer.setFlipX(playerInfo.flip);
                    otherPlayer.anims.play(playerInfo.anim, true);
                }
            });
          });

        this.socket.on('newPlayer', function (playerInfo) {
            var otherPlayer = self.createPlayer(self, playerInfo);
            self.physics.add.collider(otherPlayer, platforms);
            otherPlayers.add(otherPlayer);
        });
    }

    createPlayer(self, playerInfo) {
        var temp = self.physics.add.sprite(playerInfo.x, playerInfo.y, playerInfo.char + '-idle');
        temp.anims.play(playerInfo.char + '-idle', true);
        temp.playerId = playerInfo.playerId;
        temp.char = playerInfo.char;
        temp.setSize(14, 27);
        temp.setOffset(8, 5);
        temp.setBounce(0.1);
        temp.setCollideWorldBounds(true);
        temp.isTagged = false;
        if(playerInfo.char === "pinkie") {
            taggers.add(temp);
        } else {
            runners.add(temp);
        }
        return temp;
    }

    update() {

        // if(player.isTagged) {
        //     this.endRound();
        //     displayText(this, "Game starting in 3...", 1000, ()=> {
        //         displayText(this, "Game starting in 2...", 1000, ()=> {
        //             displayText(this, "Game starting in 1...", 1000, ()=> {
        //                 gameStarted = true;
        //             })
        //         })
        //     })
        // }


        // // Define chaser
        
        
        if(gameStarted && playerGenerated && !player.tagged) {
            
            // console.log(this.taggers);
            if (cursors.up.isDown && player.body.onFloor()) {
                player.setVelocityY(-400);
            } else if (cursors.left.isDown) {
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
            
            if(player.oldPosition && (player.x !== player.oldPosition.x || player.y !== player.oldPosition.y)) {
                this.socket.emit('playerMovement', { 
                    x: player.x,
                    y: player.y,
                    flip: player.flipX,
                    anim: player.anims.getCurrentKey()
                });
            }
            // save old position
            player.oldPosition = {
                x: player.x,
                y: player.y,
                flip: player.flipX,
                anim: player.anims.getCurrentKey()
            }      
        }
    }

    handleTag (taggedPlayer) {
        if(!taggedPlayer.isTagged) {
            this.socket.emit('tag', taggedPlayer.playerId);
            taggedPlayer.isTagged = true;
            taggedPlayer.anims.play('owlet-death');
            taggedPlayer.setVelocity(0, 0);
        }
    }

    endRound () {
        player.isTagged = false;
        player.setPosition(100,300);
        player2.setPosition(700, 300);
        player.setVelocity(0, 0);
        player2.setVelocity(0, 0);
        player.anims.play(player.char + '-idle', true);
    }
}

function displayText(scene, textInput, duration, callback) {
    const screenCenterX = scene.cameras.main.worldView.x + scene.cameras.main.width / 2;
    const screenCenterY = scene.cameras.main.worldView.y + scene.cameras.main.height / 2;
    var text = scene.add.text(screenCenterX, screenCenterY, textInput, {backgroundColor: "#ffo"}).setOrigin(0.5);
    scene.time.addEvent({
        delay: duration,
        callback: () => {
            text.destroy();
            callback();
        }
    })
}