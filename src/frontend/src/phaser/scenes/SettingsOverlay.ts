import { Scene } from "phaser";
import type { GameObject } from "../backend/types";
import { saveGame } from "../backend/API";
import { EventBus } from '../EventBus';

export class SettingsOverlay extends Scene {
    constructor() {
        super('SettingsOverlay');
    }

    private gameData!: GameObject;
    private buttons!: Phaser.GameObjects.Text[];
    private overlay!: Phaser.GameObjects.Container;
    private currentButtonIndex: number = 0;

    init(gameData: GameObject) {
        this.gameData = gameData;
    }

    preload() {
        this.load.image('menu', 'assets/menu-border.png');
    }

    create() {
        const { width, height } = this.scale;

        this.overlay = this.add.container(width / 2, height + height / 2); // Start below the screen

        this.overlay.add(this.add.image(0, 0, 'menu')
            .setDisplaySize(0.33 * width, 0.8 * height)
            .setOrigin(0.5));

        this.overlay.add(this.add.text(0, -0.25 * height, 'Settings', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5));

        this.buttons = [
            this.add.text(0, -0.10 * height, 'Resume', { fontSize: '24px', color: '#ffffff' })
                .on('pointerdown', this.resume)
                .on('pointerover', () => {
                    this.currentButtonIndex = 0;
                    this.highlightButton();
                })
                .on('pointerout', () => {
                    this.currentButtonIndex = -1;
                    this.highlightButton();
                })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5),
            this.add.text(0, 0, 'Save Game', { fontSize: '24px', color: '#ffffff' })
                .on('pointerdown', this.save)
                .on('pointerover', () => {
                    this.currentButtonIndex = 1;
                    this.highlightButton();
                })
                .on('pointerout', () => {
                    this.currentButtonIndex = -1;
                    this.highlightButton();
                })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5),
            this.add.text(0, 0.05 * height, 'Exit and Save', { fontSize: '24px', color: '#ffffff' })
                .on('pointerdown', this.exitAndSave)
                .on('pointerover', () => {
                    this.currentButtonIndex = 2;
                    this.highlightButton();
                })
                .on('pointerout', () => {
                    this.currentButtonIndex = -1;
                    this.highlightButton();
                })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5),
            this.add.text(0, 0.10 * height, 'Exit', { fontSize: '24px', color: '#ffffff' })
                .on('pointerdown', this.exit)
                .on('pointerover', () => {
                    this.currentButtonIndex = 3;
                    this.highlightButton();
                })
                .on('pointerout', () => {
                    this.currentButtonIndex = -1;
                    this.highlightButton();
                })
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5)
        ];

        this.overlay.add(this.buttons);

        // Animate the overlay to rise up into view
        this.tweens.add({
            targets: this.overlay,
            y: height / 2,
            duration: 500,
            ease: 'Power2'
        });

        this.highlightButton();

        // Add other settings options (e.g., volume control, key bindings) here
    }

    resume = () => {
        const { width, height } = this.scale;

        this.tweens.add({
            targets: this.overlay, 
            y: height + height / 2, 
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.scene.stop(); 
                this.scene.wake('Room');
            }
        });
    };

    exit = () => {
        this.scene.stop();
        EventBus.emit('change-scene', { sceneKey: 'MainMenu' });
    };

    save = async () => {
        this.buttons[1].setText('Saving...');
        this.buttons[1].setColor('#ffffff');
        this.scene.pause();
        await saveGame(this.gameData);
        this.scene.wake();
        this.buttons[1].setText('Save Game');
    };

    exitAndSave = async () => {
        this.buttons[2].setText('Saving...');
        this.scene.pause();
        await saveGame(this.gameData);
        this.scene.wake();
        this.scene.stop();
        EventBus.emit('change-scene', { sceneKey: 'MainMenu' });
    };

    highlightButton() {
        this.buttons.forEach((button, i) => {
            button.setStyle({ color: i === this.currentButtonIndex ? '#ff0000' : '#ffffff' }); // Highlight current button
        });
    };

    update() {
        const esc = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        const tab = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
        // Escape
        if (Phaser.Input.Keyboard.JustDown(esc!)) {
            this.resume();
        }
    
        // Tab
        if (Phaser.Input.Keyboard.JustDown(tab!)) {
            this.currentButtonIndex = (this.currentButtonIndex + 1) % this.buttons.length; // Cycle through buttons
            this.highlightButton();
        }
        
        // Enter
        if (Phaser.Input.Keyboard.JustDown(enter!)) {
            // Activate the current setting
            switch (this.currentButtonIndex) {
                case 0:
                    this.resume();
                    break;
                case 1:
                    this.save();
                    break;
                case 2:
                    this.exitAndSave();
                    break;
                case 3:
                    this.exit();
                    break;
            }
        }
    }
}