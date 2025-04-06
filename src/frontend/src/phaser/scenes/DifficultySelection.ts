import Phaser, { Game } from 'phaser';
import type { GameObject } from '../backend/types';
import { getGame } from '../backend/API';

export class DifficultySelection extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelection' });
    }

    theme: string;

    init(data: { theme: string }) {
        // Get the theme from the previous scene
        this.theme = data.theme;
    }

    preload() {
    }

    create() {
        const { width, height } = this.scale;

        const easyButton = this.add.text(width / 2 - 300, height / 2, 'Easy', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => easyButton.setColor('#f00'))
            .on('pointerout', () => easyButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(0));

        const mediumButton = this.add.text(width / 2, height / 2, 'Medium', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => mediumButton.setColor('#f00'))
            .on('pointerout', () => mediumButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(1));

        const hardButton = this.add.text(width / 2 + 300, height / 2, 'Hard', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => hardButton.setColor('#f00'))
            .on('pointerout', () => hardButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(2));
    }

    async startGame(difficulty: number) {
        // Fetch game data from backend
        const gameData: (GameObject | null) = await getGame(difficulty, this.theme);

        // Start first room scene
        if (gameData) {
            this.scene.start('Room', { roomId: 1, gameData, pos: "center" });
        } else {
            console.error('Failed to create game data');
        }
    }
}