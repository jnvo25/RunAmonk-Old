var player;
var player2;
var cursors;

let keyA;
let keyS;
let keyD;
let keyW;
export class HomeStage extends Phaser.Scene {
    constructor() {
        super('HomeStage');
    }

    preload() {
        // Player 1 assets
        this.load.spritesheet('owlet-idle', 'assets/Owlet_Monster/Owlet_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-run', 'assets/Owlet_Monster/Owlet_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-jump', 'assets/Owlet_Monster/Owlet_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });

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

        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        const backgroundImage = this.add.image(0,0, 'background').setOrigin(0,0);
        backgroundImage.setScale(2, 0.8);

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('terrain_tilesheet', 'tiles');
        const platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
        platforms.setCollisionByExclusion(-1, true);

        // Create player 1
        player = this.physics.add.sprite(100, 300, 'owlet-idle');
        player.setBounce(0.1);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, platforms);

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

        // Create player 2
        player2 = this.physics.add.sprite(700, 300, 'pinkie-idle');
        player2.setBounce(0.1);
        player2.setCollideWorldBounds(true);
        this.physics.add.collider(player2, platforms);

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

    }

    update() {
        if (cursors.up.isDown && player.body.onFloor()) {
            player.setVelocityY(-400);
        } else if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.setFlipX(true);
            player.anims.play('owlet-run', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.setFlipX(false);
            player.anims.play('owlet-run', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('owlet-idle', true);
        }

        if (keyW.isDown && player2.body.onFloor()) {
            player2.setVelocityY(-400);
        } else if (keyA.isDown) {
            player2.setVelocityX(-160);
            player2.setFlipX(true);
            player2.anims.play('pinkie-run', true);
        } else if (keyD.isDown) {
            player2.setVelocityX(160);
            player2.setFlipX(false);
            player2.anims.play('pinkie-run', true);
        } else {
            player2.setVelocityX(0);
            player2.anims.play('pinkie-idle', true);
        }

    }
}