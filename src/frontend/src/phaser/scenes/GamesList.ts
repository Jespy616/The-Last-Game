import { getGames } from "../backend/API";
import type { GamePreview } from "../backend/types";

export class GamesList extends Phaser.Scene {
    constructor() {
        super({ key: 'GamesList' });
    }

    games: GamePreview[] | null = null;

    async init() {
        const games: GamePreview[] | null = await getGames();
        if (!games) {
            console.error('Failed to fetch games');
            this.scene.start('MainMenu');
        }
        this.games = games;
        this.displayGames();
    }

    create() {
        const { width, height } = this.scale;
    
        this.add.text(width / 2, height * 0.1, 'Games List', {
            fontSize: '48px',
            color: '#fff'
        }).setOrigin(0.5);
    
        // Create a container for the game buttons
        const gamesContainer = this.add.container(0, 0);
    
        // Add game buttons to the container
        if (this.games) {
            this.games.forEach((game, index) => {
                const gameButton = this.add.text(width * 0.2, height * 0.25 + (index * 50), `Game ${index}: Floor ${game.Level}`, {
                    fontSize: '32px',
                    color: '#fff'
                }).setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerover', () => gameButton.setColor('#f00'))
                    .on('pointerout', () => gameButton.setColor('#fff'))
                    .on('pointerdown', () => {
                        this.scene.launch('Transition', { prevSceneKey: 'GamesList', nextSceneKey: 'Loader', nextSceneData: { gameID: game.ID } });
                        gameButton.setColor('#fff');
                    });
    
                gamesContainer.add(gameButton);
            });
        }
    
        // Create a mask to restrict the visible area
        const maskShape = this.add.graphics();
        maskShape.fillStyle(0x000000, 1);
        maskShape.fillRect(0, height * 0.2, width, height * 0.6); // Adjust the mask area
        const mask = maskShape.createGeometryMask();
        gamesContainer.setMask(mask);
    
        // Enable scrolling with the mouse wheel
        this.input.on('wheel', (deltaY: number) => {
            gamesContainer.y -= deltaY * 0.5; // Adjust scroll speed
            // Prevent scrolling beyond the content
            gamesContainer.y = Phaser.Math.Clamp(gamesContainer.y, -gamesContainer.height + height * 0.8, 0);
        });
    }

    displayGames() {
        if (!this.games) {
            console.error('No games available');
            return;
        }

        const { width, height } = this.scale;

        this.games.forEach((game, index) => {
            const gameButton = this.add.text(width * .2, height * .25 + (index * 50), `Game ${index}: Floor ${game.Level}`, {
                fontSize: '32px',
                color: '#fff'
            }).setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => gameButton.setColor('#f00'))
                .on('pointerout', () => gameButton.setColor('#fff'))
                .on('pointerdown', () => {
                    this.scene.launch('Transition', { prevSceneKey: 'GamesList', nextSceneKey: 'Loader', nextSceneData: { gameID: game.ID } });
                    gameButton.setColor('#fff');
                });
        });
    }
}
