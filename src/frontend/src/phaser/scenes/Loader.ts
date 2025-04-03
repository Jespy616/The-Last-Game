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
        // Fetch game data
        this.gameData = await getGame(this.difficulty, this.theme);

        if (this.gameData) {
            const proceedButton = this.add.text(width - 100, height - 50, 'Skip', {
                fontSize: '24px',
                color: '#fff',
                backgroundColor: '#000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.scene.stop('StoryText');
                    this.scene.launch('Transition', { prevSceneKey: 'Loader', nextSceneKey: 'Room', nextSceneData: { roomId: 1, gameData: this.gameData, pos: 'center' } }); // Use prevSceneKey
                })
                .on('pointerover', () => proceedButton.setColor('#f00'))
                .on('pointerout', () => proceedButton.setColor('#fff'));
        } else {
            console.error('Failed to create game data');
        }
    }
}
