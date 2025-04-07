import Phaser, { Game } from 'phaser';
import { getGame } from '../backend/API';
import type { GameObject } from '../backend/types';

export class DifficultySelection extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelection' });
    }

    theme!: string;

    init(data: { theme: string }) {
        // Get the theme from the previous scene
        this.theme = data.theme;
    }

    preload() {
    }

    create() {
        const { width, height } = this.scale;

        const easyButton = this.add.text(width / 2 - 150, height / 2, 'Easy', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => easyButton.setColor('#f00'))
            .on('pointerout', () => easyButton.setColor('#fff'))
            .on('pointerdown', () => {
                this.startGame("easy");
                easyButton.setColor('#fff');
            });

        const mediumButton = this.add.text(width / 2, height / 2, 'Medium', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => mediumButton.setColor('#f00'))
            .on('pointerout', () => mediumButton.setColor('#fff'))
            .on('pointerdown', () => {
                this.startGame("medium")
                mediumButton.setColor('#fff');
            });

        const hardButton = this.add.text(width / 2 + 160, height / 2, 'Hard', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => hardButton.setColor('#f00'))
            .on('pointerout', () => hardButton.setColor('#fff'))
            .on('pointerdown', () => {
                this.startGame("hard")
                hardButton.setColor('#fff');
            });
    }

    async startGame(difficulty: string) {
        this.scene.launch('Transition', { prevSceneKey: 'DifficultySelection', nextSceneKey: 'Loader', nextSceneData: { theme: this.theme, difficulty: difficulty } }); // Use prevSceneKey
        
    }
}