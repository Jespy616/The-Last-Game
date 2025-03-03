import Phaser from 'phaser';
import type { GameObject } from '../backend/types';
import { GameFactory } from '../util/GameFactory';

export class DifficultySelection extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelection' });
    }
    theme: string;

    init(data: { theme: string }) {
        this.theme = data.theme;
    }

    preload() {
    }

    create() {
        const { width, height } = this.scale;

        // Create buttons
        const easyButton = this.add.text(width / 2 - 150, height / 2, 'Easy', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => easyButton.setColor('#f00'))
            .on('pointerout', () => easyButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(0));

        const mediumButton = this.add.text(width / 2, height / 2, 'Medium', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => mediumButton.setColor('#f00'))
            .on('pointerout', () => mediumButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(1));

        const hardButton = this.add.text(width / 2 + 160, height / 2, 'Hard', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => hardButton.setColor('#f00'))
            .on('pointerout', () => hardButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(2));
    }

    async startGame(difficulty: number) {
        const gameData = await GameFactory(difficulty, this.theme);
        console.log('Starting game with:', gameData);
        if (gameData) {
            this.scene.start('Game', { roomId: 1, gameData });
        } else {
            console.error('Failed to create game data');
        }
    }
}