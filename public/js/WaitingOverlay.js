import { Button } from "./button.js";

export class WaitingOverlay extends Phaser.Scene {
    constructor() {
        super('WaitingOverlay');
        this.playerCircles = new Set();
    }

    preload() {
        this.screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        this.screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    }

    create() {
        // Setup connections
        this.socket = this.registry.get('socket');
        const scene = this; // Sometimes sockets don't like "this" so define this outside and pass in
        this.socket.on('newPlayer', req => {
            const roomInfo = req;
            console.log("A new player has connected");
            scene.updatePlayerCircles(roomInfo.readyPlayers, roomInfo.totalPlayers);
        })

        this.socket.on('disconnectedPlayer', req => {
            console.log(req);
            console.log("A player has disconnected");
            scene.updatePlayerCircles(roomInfo.readyPlayers, roomInfo.totalPlayers);
        })

        this.socket.on('waitingUpdate', req => {
            const roomInfo = req;
            console.log("Updating waiting");
            scene.updatePlayerCircles(roomInfo.readyPlayers, roomInfo.totalPlayers);
        })

        this.socket.on('currentPlayers', req => {
            const roomInfo = req.roomInfo;
            console.log(req);
            console.log("Joining update");
            scene.updatePlayerCircles(roomInfo.readyPlayers, roomInfo.totalPlayers);
        })

        // Display player UI
        this.displayText("Waiting for players to ready");        
        this.readyButton = new Button(this.screenCenterX, this.screenCenterY+50, 'Ready', this, () => {
            this.socket.emit('playerReady');
        });
    } 

    update() {

    }
    
    // Displays text on screen
    displayText(textInput) {
        if (this.screenText !== undefined) 
            this.removeText();
        this.screenText = this.add.text(this.screenCenterX, this.screenCenterY-100, textInput, {backgroundColor: "#ffo", fontSize: "40px"}).setOrigin(0.5);
    }

    updatePlayerCircles(readyPlayers, totalPlayers) {
        console.log("Updating to accomodate " + totalPlayers + " total players");

        // Destroy existing circles
        this.playerCircles.forEach(circle => {
            circle.destroy();
        });

        // Create dynamically colored circle for every player
        console.log(totalPlayers);
        for(var i=0; i<totalPlayers; i++) {
            console.log("Player")
            this.playerCircles.add(
                this.add.circle(
                    (this.screenCenterX-((totalPlayers-1)*50)/2)+i*50, 
                    this.screenCenterY-20, 15, 
                    i<readyPlayers? 0x00bf19 : 0x575757
                )
            )
        }
    }
}