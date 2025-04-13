import Phaser from 'phaser';
import type { GameObject } from '../backend/types';

export class StoryText extends Phaser.Scene {
    gameData!: GameObject;

    constructor() {
        super({ key: 'StoryText' });
    }

    init(data: { gameData: GameObject }) {
        this.gameData = data.gameData;
    }

    preload() {
        this.load.image('space-background', 'assets/space-background.webp');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'space-background').setOrigin(0.5).setDisplaySize(width, height);

        console.log(`Game Data:\n`, this.gameData);
        const text = this.add.text(width / 2, height, this.gameData.Floor.StoryText, {
            fontSize: '32px',
            color: '#fff',
            align: 'center',
            wordWrap: { width: width - 50 },
        }).setOrigin(0.5, 0);

        // Text Crawl
        this.tweens.add({
            targets: text,
            y: -height,
            duration: 40000,
            ease: 'Linear',
        });

        const proceedButton = this.add.text(width - 100, height - 50, 'Skip', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop('StoryText');
                const roomID = Math.min(...(this.gameData.Floor.Rooms.map(room => room.ID)));
                console.log('Starting Room ID:', roomID);
                this.scene.launch('Transition', { prevSceneKey: 'Loader', nextSceneKey: 'Room', nextSceneData: { roomId: roomID, gameData: this.gameData, pos: 'center' } }); // Use prevSceneKey
            })
            .on('pointerover', () => proceedButton.setColor('#f00'))
            .on('pointerout', () => proceedButton.setColor('#fff'));
    }
}
