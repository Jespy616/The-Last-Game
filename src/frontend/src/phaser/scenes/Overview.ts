import Phaser from 'phaser';

export class Overview extends Phaser.Scene {
    constructor() {
        super({ key: 'Overview' });
    }

    preload() {
        // Load any assets here if needed
    }

    create() {
        const { width, height } = this.scale;

        const title = this.add.text(width / 2, height * 0.1, 'WELCOME TO THE LAST GAME', {
			fontFamily: 'cc-pixel-arcade-display',
			fontSize: '72px',
			color: '#cffffc',
			stroke: '#48ddd4',
			strokeThickness: 2,
			align: 'center',
			wordWrap: { width: width * 0.9 },
            letterSpacing: 5,
		}).setOrigin(0.5);

		const bodyText = 
`In a world controlled by AI, you are humanity's final hope.

This is a turn-based, roguelike adventure where no two runs are the same. Each level is procedurally generated using AI-driven logic to create dynamic floors, randomized rooms, enemies, weapons, and events.

Before each run, you'll choose a theme — such as Desert, Jungle, or Castle. Each theme completely changes the style, enemies, and layout of the game world.

You'll also choose a difficulty:

  • Easy – For those new to strategy and roguelikes.
  • Medium – A balanced experience with fair challenge.
  • Hard – Brutal AI aggression and unforgiving floors.

Use your wits, your weapons, and a little luck to survive as long as you can.`;

		const body = this.add.text(width / 2, height * 0.2, bodyText, {
			fontFamily: 'cc-pixel-arcade-display',
			fontSize: '20px',
			color: '#ffffff',
			align: 'left',
			wordWrap: { width: width * 0.8 }
		}).setOrigin(0.5, 0);

        const spaceButton = this.add.text(width * 0.9, height * 0.9, 'Next', { fontFamily: 'cc-pixel-arcade-display', fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => spaceButton.setColor('#f00'))
            .on('pointerout', () => spaceButton.setColor('#fff'))
            .on('pointerdown', () => this.scene.launch('Transition', { prevSceneKey: 'Overview', nextSceneKey: 'ThemeSelection' }));
    }
}