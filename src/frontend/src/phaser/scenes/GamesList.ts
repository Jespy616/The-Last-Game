import { getGames } from "../backend/API";
import type { GamePreview } from "../backend/types";
import { formatButton } from "../ui/FormatButton";

export class GamesList extends Phaser.Scene {
    constructor() {
        super({ key: 'GamesList' });
    }

    games: GamePreview[] | null = null;

    async init() {
        const games: GamePreview[] | null = await getGames();
        if (games == null) {
            console.error('Failed to fetch games');
            this.games = []
        }
        else {
            this.games = games;
        }
        this.displayGames();
    }

    create() {
        const { width, height } = this.scale;
    
        this.add.text(width / 2, height * 0.1, 'Games List', {
            fontSize: '48px',
            color: '#fff'
        }).setOrigin(0.5);

        const back = this.add.text(width * .1 , height * 0.1, 'Back', {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5)
            .on('pointerdown', () => {
                this.scene.launch('Transition', { prevSceneKey: 'GamesList', nextSceneKey: 'MainMenu' });
            });
            
        formatButton(back);
        // Create a container for the game buttons
    }

    displayGames() {
        if (!this.games) {
            console.error('No games available');
            return;
        }

        const { width, height } = this.scale;

        this.games.forEach((game, index) => {
            const gameButton = this.add.text(width * .2, height * .25 + (index * 50), `Game ${index + 1}`, {
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
