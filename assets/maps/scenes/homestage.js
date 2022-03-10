var player;
var cursors;
export class HomeStage extends Phaser.Scene {
    constructor() {
        super('HomeStage');
    }

    preload() {
        this.load.spritesheet('owlet-idle', 'assets/Owlet_Monster/Owlet_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-run', 'assets/Owlet_Monster/Owlet_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('owlet-jump', 'assets/Owlet_Monster/Owlet_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });

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
    }
}