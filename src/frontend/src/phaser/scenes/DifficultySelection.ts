import Phaser, { Game } from 'phaser';
import { getGame } from '../backend/API';
import type { GameObject } from '../backend/types';

export class DifficultySelection extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelection' });
    }
    
    devMode: boolean = false;
    theme!: string;
    gameData?: GameObject;

    init(data: { theme: string, gameData?: GameObject }) {
        // Get the theme from the previous scene
        this.theme = data.theme;
        this.gameData = data.gameData;
    }

    preload() {
    }

    create() {
        const { width, height } = this.scale;

        // Konami code sequence
        const konamiCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        let konamiIndex = 0;

        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (event.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.devMode = true;
                    console.log('\nDev mode activated!');
                    konamiIndex = 0; // Reset the sequence
                }
            } else {
                konamiIndex = 0; // Reset if sequence is broken
            }
        });

        const easyButton = this.add.text(width / 2 - 300, height / 2, 'Easy', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => easyButton.setColor('#f00'))
            .on('pointerout', () => easyButton.setColor('#fff'))
            .on('pointerdown', () => {
                this.startGame("easy");
                easyButton.setColor('#fff');
            });

        const mediumButton = this.add.text(width / 2, height / 2, 'Medium', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => mediumButton.setColor('#f00'))
            .on('pointerout', () => mediumButton.setColor('#fff'))
            .on('pointerdown', () => {
                this.startGame("medium")
                mediumButton.setColor('#fff');
            });

        const hardButton = this.add.text(width / 2 + 300, height / 2, 'Hard', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
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
        if (!this.gameData) { // New Game
            this.scene.launch('Transition', { prevSceneKey: 'DifficultySelection', nextSceneKey: 'Loader', nextSceneData: { theme: this.theme, difficulty: difficulty, devMode: this.devMode } });
        }
        else { // New Floor
            this.scene.launch('Transition', { prevSceneKey: 'DifficultySelection', nextSceneKey: 'Loader', nextSceneData: { gameData: this.gameData, theme: this.theme, difficulty: difficulty, devMode: this.devMode } });
        }
    }
}