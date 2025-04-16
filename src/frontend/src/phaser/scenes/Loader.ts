import Phaser from 'phaser';
import type { GameObject } from '../backend/types';
import { getFloor, getGame } from '../backend/API';

export class Loader extends Phaser.Scene {
    constructor() {
        super({ key: 'Loader' });
    }

    async init(data: { theme?: string; difficulty: string; gameData?: GameObject }) {
        let gameData: GameObject | null = null;
        if (data.theme) {
            gameData = await getGame(data.difficulty, data.theme);
        }
        else if (data.gameData) {
            data.gameData.Level = data.gameData.Level + 1;
            const newFloor = await getFloor(data.difficulty, data.gameData.Theme, data.gameData.Level);
            if (!newFloor) {
                this.scene.start('MainMenu');
                console.error('Failed to fetch new floor');
                return;
            }
            data.gameData.Floor = newFloor;
            gameData = data.gameData;
        }
        if (!gameData) {
            this.scene.start('MainMenu');
            console.error('Failed to fetch story text');
            return;
        }
        console.log('Game Data:\n', gameData);
        this.scene.launch('Transition', { prevSceneKey: 'Loader', nextSceneKey: 'StoryText', nextSceneData: {gameData: gameData} });
    }

    create() {
        const { width, height } = this.scale;
        
        this.add.text(width - 100, height - 50, 'Loading...', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5)
    }
}
