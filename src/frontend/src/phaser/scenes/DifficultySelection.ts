import Phaser, { Game } from 'phaser';
import { getStoryText } from '../backend/API';

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
            .on('pointerdown', () => this.startGame(0));

        const mediumButton = this.add.text(width / 2, height / 2, 'Medium', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => mediumButton.setColor('#f00'))
            .on('pointerout', () => mediumButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(1));

        const hardButton = this.add.text(width / 2 + 160, height / 2, 'Hard', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => hardButton.setColor('#f00'))
            .on('pointerout', () => hardButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame(2));
    }

    async startGame(difficulty: number) {
        // Fetch story text from backend
        const storyText: string | null = await getStoryText();

        if (storyText) {
            this.scene.launch('Transition', { prevSceneKey: 'DifficultySelection', nextSceneKey: 'StoryText', nextSceneData: { storyText } }); // Use prevSceneKey
            this.scene.launch('Loader', { difficulty, theme: this.theme }); // Launch Loader in parallel
        } else {
            console.error('Failed to fetch story text');
        }
    }
}