import Phaser from 'phaser';
import type { GameObject } from '../backend/types';
import { getFloor, createGame, getGame } from '../backend/API';

export class Loader extends Phaser.Scene {
    constructor() {
        super({ key: 'Loader' });
    }

    async init(data: { theme: string; difficulty: string; gameData?: GameObject, devMode?: boolean, gameID?: number }) {
        let gameData: GameObject | null = null;
        if (data.gameID) {
            const game: GameObject | null = await getGame(data.gameID);
            if (!game) {
                this.scene.start('MainMenu');
                console.error('Failed to fetch game');
                return;
            }
            gameData = game;
            console.log('Load Game')

        }
        else if (!data.gameData) {
            gameData = await createGame(data.difficulty, data.theme);
            console.log('New Game')

        }
        else {
            data.gameData.Level = data.gameData.Level + 1;
            const newFloor = await getFloor(data.difficulty, data.theme, data.gameData.Level, data.gameData.Floor.StoryText, data.gameData.Floor.Theme);
            if (!newFloor) {
                this.scene.start('MainMenu');
                console.error('Failed to fetch new floor');
                return;
            }
            data.gameData.Floor = newFloor;
            data.gameData.Floor.Theme = data.theme;
            gameData = data.gameData;
            console.log('New Floor')
        }
        console.log('Game data:', gameData);
        if (data.devMode) {
            gameData!.Player.MaxHealth = 999999;
            gameData!.Player.CurrentHealth = 999999;
            gameData!.Player.PrimaryWeapon.Damage = 999999;
            gameData!.Player.PrimaryWeapon.Sprite = "Erik's Lightsaber";
        }
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
