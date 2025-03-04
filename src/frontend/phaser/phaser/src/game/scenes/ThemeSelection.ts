import Phaser from 'phaser';

export class ThemeSelection extends Phaser.Scene {
    constructor() {
        super({ key: 'ThemeSelection' });
    }

    preload() {
        // Load any assets here if needed
    }

    create() {
        const { width, height } = this.scale;

        // Create buttons
        const spaceButton = this.add.text(width / 2 - 150, height / 2, 'Castle', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => spaceButton.setColor('#f00'))
            .on('pointerout', () => spaceButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame('castle'));

        const fantasyButton = this.add.text(width / 2, height / 2, 'Jungle', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => fantasyButton.setColor('#f00'))
            .on('pointerout', () => fantasyButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame('jungle'));

        const dungeonButton = this.add.text(width / 2 + 160, height / 2, 'Desert', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => dungeonButton.setColor('#f00'))
            .on('pointerout', () => dungeonButton.setColor('#fff'))
            .on('pointerdown', () => this.startGame('desert'));
    }

    startGame(theme: string) {
        this.scene.start('DifficultySelection', { theme });
    }
}