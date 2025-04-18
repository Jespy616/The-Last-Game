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

        this.add.text(width / 2, height / 2, 'Games List', {
            fontSize: '48px',
            color: '#fff'
        }).setOrigin(0.5);
    }

    displayGames() {
        if (!this.games) {
            console.error('No games available');
            return;
        }

        const { width, height } = this.scale;

        this.games.forEach((game, index) => {
            const gameButton = this.add.text(width / 2, height / 2 + (index * 50), `Game ${index}: Floor ${game.Level}`, {
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
