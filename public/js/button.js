export class Button {    
    constructor(x, y, label, scene, callback) {
        this.button = scene.add.text(x, y, label)
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => this.button.setStyle({ 
                fill: '#FFF',
                backgroundColor: '#5e5e5e'
            }))
            .on('pointerout', () => this.button.setStyle({ 
                fill: '#FFF',
                backgroundColor: '#111'
            }));
    }

    remove() {
        this.button.destroy();
    }
}
