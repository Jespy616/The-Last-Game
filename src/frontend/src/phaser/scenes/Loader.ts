import Phaser from 'phaser';
import { getGame } from '../backend/API';
import type { GameObject } from '../backend/types';

export class Loader extends Phaser.Scene {
    constructor() {
        super({ key: 'Loader' });
    }

    init(data: { difficulty: number; theme: string }) {
        this.difficulty = data.difficulty;
        this.theme = data.theme;
    }

    difficulty!: number;
    theme!: string;
    gameData: GameObject | null = null;

    async create() {
        const { width, height } = this.scale;

        // Display loading text
        const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5);

        // Fetch game data
        this.gameData = await getGame(this.difficulty, this.theme);

        // Remove loading text and display a button to proceed
        loadingText.destroy();

        if (this.gameData) {
            const proceedButton = this.add.text(width - 100, height - 50, 'Skip', {
                fontSize: '24px',
                color: '#fff',
                backgroundColor: '#000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    // Stop StoryText and start the Room scene
                    this.scene.stop('StoryText');
                    this.scene.start('Room', { roomId: 1, gameData: this.gameData, pos: 'center' });
                })
                .on('pointerover', () => proceedButton.setColor('#f00'))
                .on('pointerout', () => proceedButton.setColor('#fff'));
        } else {
            console.error('Failed to create game data');
        }
    }
}
