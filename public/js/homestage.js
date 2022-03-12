var player;
var player2;
var playerScore;
var player2Score;
var p1text;
var p2text;
var cursors;
var gameStarted;
var playerGenerated;

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

        // Create player 2
        // player2 = this.physics.add.sprite(700, 300, 'pinkie-idle');
        // player2.setSize(14, 27);
        // player2.setOffset(8, 5);
        // player2.setBounce(0.1);
        // player2.setCollideWorldBounds(true);
        // this.physics.add.collider(player2, platforms);

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

        // player.on('animationcomplete', () => {
        //     if(player.anims.currentAnim.key === 'owlet-death') {
        //         player.isTagged = true;

        //     }
        // })

        playerScore = 0;
        player2Score = 0;

        p1text = this.add.text(10, 10, "Player 1: " + playerScore, {backgroundColor: "#ffo"});
        p2text = this.add.text(10, 30, "Player 2: " + player2Score, {backgroundColor: "#ffo"});

        var self = this;
        this.socket = io();

        // Create player 1
        playerGenerated = false;
        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                console.log(players[id]);
                console.log(self.socket.id);
                if(players[id].playerId == self.socket.id) {
                    if(players[id].char === "owlet") {
                        player = self.physics.add.sprite(players[id].x, players[id].y, 'owlet-idle');
                        player.char = "owlet";
                        player.setSize(14, 27);
                        player.setOffset(8, 5);
                        player.setBounce(0.1);
                        player.setCollideWorldBounds(true);
                        player.isTagged = false;
                        self.physics.add.collider(player, platforms);
                        playerGenerated = true;
                    } else {
                        player = self.physics.add.sprite(players[id].x, players[id].y, 'pinkie-idle');
                        player.char = "pinkie";
                        player.setSize(14, 27);
                        player.setOffset(8, 5);
                        player.setBounce(0.1);
                        player.setCollideWorldBounds(true);
                        player.isTagged = false;
                        self.physics.add.collider(player, platforms);
                        playerGenerated = true;
                    }
                    
                } else {
                    var otherPlayer = players[id];
                    if(otherPlayer.char === "owlet") {
                        player2 = self.physics.add.sprite(players[id].x, players[id].y, 'owlet-idle');    
                        player2.setSize(14, 27);
                        player2.setOffset(8, 5);
                        player2.setBounce(0.1);
                        player2.setCollideWorldBounds(true);
                        player2.isTagged = false;
                        self.physics.add.collider(player2, platforms);   
                        player2.anims.play('owlet-idle', true);
                    } else {
                        player2 = self.physics.add.sprite(players[id].x, players[id].y, 'pinkie-idle');    
                        player2.setSize(14, 27);
                        player2.setOffset(8, 5);
                        player2.setBounce(0.1);
                        player2.setCollideWorldBounds(true);
                        player2.isTagged = false;
                        self.physics.add.collider(player2, platforms); 
                        player2.anims.play('pinkie-idle', true);
                    }
                }
            });
        })

        this.socket.on('disconnectedPlayer', () => {
            player2.destroy();
        })

        this.socket.on('playerMoved', function (playerInfo) {
            console.log("player has moved!");
            console.log(playerInfo);
            // player2.setPosition(playerInfo.x, playerInfo.y);
            player2.setPosition(playerInfo.x, playerInfo.y);
            player2.setFlipX(playerInfo.flip);
            player2.anims.play(playerInfo.anim, true);
            // self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            //   if (playerInfo.playerId === otherPlayer.playerId) {
            //     otherPlayer.setRotation(playerInfo.rotation);
            //     otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            //   }
            // });
          });

        this.socket.on('newPlayer', function (playerInfo) {
            console.log("ASFASDF");
            if(playerInfo.char === "owlet") {
                player2 = self.physics.add.sprite(100, 300, 'owlet-idle');    
            } else {
                player2 = self.physics.add.sprite(100, 300, 'pinkie-idle');    
            }
            
            player2.setSize(14, 27);
            player2.setOffset(8, 5);
            player2.setBounce(0.1);
            player2.setCollideWorldBounds(true);
            player2.isTagged = false;
            self.physics.add.collider(player2, platforms);
        });
        


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
        // this.physics.collide(player, player2, this.tagged);

        if(gameStarted && playerGenerated) {
            if (cursors.up.isDown && player.body.onFloor()) {
                player.setVelocityY(-400);
            } else if (cursors.left.isDown) {
                player.setVelocityX(-160);
                player.setFlipX(true);
                if(player.char === "owlet")
                    player.anims.play('owlet-run', true);
                else
                    player.anims.play('pinkie-run', true);
            } else if (cursors.right.isDown) {
                player.setVelocityX(160);
                player.setFlipX(false);
                if(player.char === "owlet")
                    player.anims.play('owlet-run', true);
                else
                    player.anims.play('pinkie-run', true);
            } else {
                player.setVelocityX(0);
                if(player.char === "owlet")
                    player.anims.play('owlet-idle', true);
                else
                    player.anims.play('pinkie-idle', true);
            }
            
            if(player.oldPosition && (player.x !== player.oldPosition.x || player.y !== player.oldPosition.y)) {
                this.socket.emit('playerMovement', { 
                    x: player.x,
                    y: player.y,
                    velX: player.body.velocity.x,
                    velY: player.body.velocity.y,
                    flip: player.flipX,
                    anim: player.anims.getCurrentKey()
                });
            }
            // save old position
            player.oldPosition = {
                x: player.x,
                y: player.y,
                velX: player.velocityX,
                velY: player.velocityY,
                flip: player.flipX,
                anim: player.anims.getCurrentKey()
            }      
        }
    }

    tagged (player, player2) {
        if(gameStarted) {
            if(!player.isTagged) {
                gameStarted = false;
                player.anims.play('owlet-death');
                player2Score += 5
                player.setVelocity(0, 0);
                p2text.setText("Player 2: " + player2Score);
            }
        }
    }

    endRound () {
        player.isTagged = false;
        player.setPosition(100,300);
        player2.setPosition(700, 300);
        player.setVelocity(0, 0);
        player2.setVelocity(0, 0);
        player.anims.play('owlet-idle', true);
        player2.anims.play('pinkie-idle', true);
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