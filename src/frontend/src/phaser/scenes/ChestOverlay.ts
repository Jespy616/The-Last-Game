import type { WeaponObject } from "../backend/types";
import { formatButton } from "../ui/FormatButton";

export class ChestOverlay extends Phaser.Scene {
    constructor() {
        super('ChestOverlay');
    }

    private playerWeapon!: WeaponObject;
    private chestWeapon!: WeaponObject;
    private onPrimary!: () => void;
    private onLeave!: () => void;
    private buttons!: Phaser.GameObjects.Text[];
    private currentButtonIndex: number = 0;

    init(data: { playerWeapon: WeaponObject, chestWeapon: WeaponObject; onPrimary: () => void; onLeave: () => void }) {
        this.playerWeapon = data.playerWeapon;
        this.chestWeapon = data.chestWeapon;
        this.onPrimary = data.onPrimary;
        this.onLeave = data.onLeave;
    }

    preload() {
        this.load.image('menu', 'assets/menu-border.png');
    }

    create() {
        const { width, height } = this.scale;

        const overlay = this.add.container(width / 2, height + height / 2); // Start below the screen

        overlay.add(this.add.image(0, 0, 'menu')
            .setDisplaySize(0.5 * width, 0.8 * height) // Make the overlay wider
            .setOrigin(0.5));

        overlay.add(this.add.text(0, -0.35 * height, 'You Found:', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5));

        // Display chest weapon stats
        const chestWeaponText = this.add.text(0, -0.20 * height, `Chest Weapon: ${this.chestWeapon.Sprite}`, { fontSize: '24px', color: '#ffffff' })
            .setOrigin(0.5);
        overlay.add(chestWeaponText);

        const chestDamageText = this.add.text(0, -0.15 * height, `Damage: ${this.chestWeapon.Damage}`, { fontSize: '24px', color: '#ffffff' })
            .setOrigin(0.5);
        overlay.add(chestDamageText);

        // Display player weapon stats
        const playerWeaponText = this.add.text(0, -0.05 * height, `Your Weapon: ${this.playerWeapon.Sprite}`, { fontSize: '24px', color: '#ffffff' })
            .setOrigin(0.5);
        overlay.add(playerWeaponText);

        const playerDamageText = this.add.text(0, 0, `Damage: ${this.playerWeapon.Damage}`, { fontSize: '24px', color: '#ffffff' })
            .setOrigin(0.5);
        overlay.add(playerDamageText);

        this.buttons = [
            this.add.text(0, 0.10 * height, 'Swap Weapons', { fontSize: '24px', color: '#ffffff' })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.onPrimary()),
            this.add.text(0, 0.15 * height, 'Leave Weapon', { fontSize: '24px', color: '#ffffff' })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.onLeave())
        ];

        this.buttons.forEach(button => formatButton(button));
        overlay.add(this.buttons);

        // Animate the overlay to rise up into view
        this.tweens.add({
            targets: overlay,
            y: height / 2,
            duration: 500,
            ease: 'Power2'
        });

        this.highlightButton();
    }

    highlightButton() {
        this.buttons.forEach((button, i) => {
            button.setStyle({ color: i === this.currentButtonIndex ? '#ff0000' : '#ffffff' }); // Highlight current button
        });
    }

    update() {
        const esc = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        const tab = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        const enter = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Escape
        if (Phaser.Input.Keyboard.JustDown(esc!)) {
            this.onLeave();
        }

        // Tab
        if (Phaser.Input.Keyboard.JustDown(tab!)) {
            this.currentButtonIndex = (this.currentButtonIndex + 1) % this.buttons.length; // Cycle through buttons
            this.highlightButton();
        }

        // Enter
        if (Phaser.Input.Keyboard.JustDown(enter!)) {
            // Activate the current button
            switch (this.currentButtonIndex) {
                case 0:
                    this.onPrimary();
                    break;
                case 1:
                    this.onLeave();
                    break;
            }
        }
    }
}