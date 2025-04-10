import { Scene } from "phaser";
import { formatButton } from "../ui/FormatButton";
import type { GameObject } from "../backend/types";
import { saveGame } from "../backend/API";


export class SettingsOverlay extends Scene {
    constructor() {
        super('SettingsOverlay');
    }

    private gameData!: GameObject;

    init(gameData: GameObject) {
        this.gameData = gameData;
    }

    preload() {
        this.load.image('menu', 'assets/menu-border.png');
    }

    create() {
        const { width, height } = this.scale;

        const overlay = this.add.container(width / 2, height + height / 2); // Start below the screen

        overlay.add(this.add.image(0, 0, 'menu')
            .setDisplaySize(0.33 * width, 0.8 * height)
            .setOrigin(0.5));

        overlay.add(this.add.text(0, -0.25 * height, 'Settings', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5));

        const resumeButton = this.add.text(0, -0.10 * height, 'Resume', { fontSize: '24px', color: '#ffffff' })
            .on('pointerdown', () => {
                this.scene.stop();
                this.scene.wake('Room');
            });
        overlay.add(resumeButton);

        const saveButton = this.add.text(0, 0, 'Save Game', { fontSize: '24px', color: '#ffffff' })
            .on('pointerdown', async () => {
                saveButton.setText('Saving...');
                saveButton.setColor('#ffffff');
                this.scene.pause();
                await saveGame(this.gameData);
                this.scene.wake();
                saveButton.setText('Save Game');
            });
        overlay.add(saveButton);

        const exitAndSaveButton = this.add.text(0, 0.05 * height, 'Exit and Save', { fontSize: '24px', color: '#ffffff' })
            .on('pointerdown', async () => {
                saveButton.setText('Saving...');
                this.scene.pause();
                await saveGame(this.gameData);
                this.scene.wake();
                this.scene.stop('Room');
                this.scene.stop('Gui');
                this.scene.start('MainMenu');
            });
        overlay.add(exitAndSaveButton);

        const exitButton = this.add.text(0, 0.10 * height, 'Exit', { fontSize: '24px', color: '#ffffff' })
            .on('pointerdown', () => {
                this.scene.stop('Room');
                this.scene.start('MainMenu');
            });
        overlay.add(exitButton);

        for (let button of [resumeButton, saveButton, exitButton, exitAndSaveButton]) {
            formatButton(button);
        }

        // Animate the overlay to rise up into view
        this.tweens.add({
            targets: overlay,
            y: height / 2,
            duration: 500,
            ease: 'Power2'
        });

        // Add other settings options (e.g., volume control, key bindings) here
    }
}