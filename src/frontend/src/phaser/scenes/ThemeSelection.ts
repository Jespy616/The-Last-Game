import Phaser from 'phaser';
import type { GameObject } from '../backend/types';

export class ThemeSelection extends Phaser.Scene {
    constructor() {
        super({ key: 'ThemeSelection' });
    }
    private gameData?: GameObject;
    init(data: { gameData?: GameObject }) {
        this.gameData = data.gameData;
    }

    create() {
        const { width, height } = this.scale;

        // Create buttons
        const spaceButton = this.add.text(width / 2 - 300, height / 2, 'Castle', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => spaceButton.setColor('#f00'))
            .on('pointerout', () => spaceButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame('castle'));

        const fantasyButton = this.add.text(width / 2, height / 2, 'Jungle', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => fantasyButton.setColor('#f00'))
            .on('pointerout', () => fantasyButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame('jungle'));

        const dungeonButton = this.add.text(width / 2 + 300, height / 2, 'Desert', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => dungeonButton.setColor('#f00'))
            .on('pointerout', () => dungeonButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame('desert'));
    }

    startGame(theme: string) {
        this.scene.launch('Transition', { prevSceneKey: 'ThemeSelection', nextSceneKey: 'DifficultySelection', nextSceneData: { theme: theme, gameData: this.gameData } }); // Use prevSceneKey
    }
}