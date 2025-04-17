import { type GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    logo!: GameObjects.Image;
    title!: GameObjects.Text;
    logoTween!: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;

        const smallFontSize = this.responsiveFont(48, width); // or height
        const largeFontSize = this.responsiveFont(96, width);

        // this.logo = this.add.image(512, 300, 'logo').setDepth(100);
        this.background = this.add.image(width / 2, height / 2, 'background').setDepth(0);

        const titleTextSmallShadow = this.add.text(width / 2 + 3, height * 0.15 + 3, "THE", {
            fontFamily: 'cc-pixel-arcade-display',
            fontSize: smallFontSize,
            color: '#48ddd4',
            stroke: '#48ddd4',
            strokeThickness: 6,
            letterSpacing: 10,
        }).setOrigin(0.5);

        const titleTextLargeShadow = this.add.text(width / 2 + 5, height * 0.3 + 5, "LAST GAME", {
            fontFamily: 'cc-pixel-arcade-display',
            fontSize: largeFontSize,
            color: '#48ddd4',
            stroke: '#48ddd4',
            strokeThickness: 8,
            letterSpacing: 10,
        }).setOrigin(0.5);

        const titleTextLarge = this.add.text(width / 2, height * 0.3, "LAST GAME", {
			fontFamily: "cc-pixel-arcade-display",
			fontSize: largeFontSize,
			color: "#cffffc",
			stroke: "#48ddd4",
			strokeThickness: 8,
            letterSpacing: 10,
		}).setOrigin(0.5);

		this.createRoundedButton(width / 2, height * 0.55, 600, 70, 20, 0x48ddd4, 'START GAME', () => {
            this.scene.launch('Transition', { prevSceneKey: 'MainMenu', nextSceneKey: 'Overview'});

		});

		

        EventBus.emit('current-scene-ready', this);
    }

    createRoundedButton(
		x: number,
		y: number,
		width: number,
		height: number,
		radius: number,
		color: number,
		text: string,
		onClick: () => void
	) {
		// Draw the rounded rect
		const graphics = this.add.graphics({ x: x - width / 2, y: y - height / 2 });
		graphics.fillStyle(color, 1);
		graphics.fillRoundedRect(0, 0, width, height, radius);

		// Interactive zone
		const hitZone = this.add
			.zone(x, y, width, height)
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		hitZone.on('pointerdown', onClick);

		hitZone.on('pointerover', () => {
			graphics.clear();
			graphics.fillStyle(0x40c2ba, 1);
			graphics.fillRoundedRect(0, 0, width, height, radius);
		});

		hitZone.on('pointerout', () => {
			graphics.clear();
			graphics.fillStyle(color, 1);
			graphics.fillRoundedRect(0, 0, width, height, radius);
		});

		// Add button text
		const label = this.add.text(x, y * 0.99, text, {
			fontFamily: 'cc-pixel-arcade-display',
			fontSize: '40px',
			color: '#ffffff'
		}).setOrigin(0.5);

		// Optional: Group them together so you can manage as a unit
		this.add.container(0, 0, [graphics, hitZone, label]);
	}

    responsiveFont(baseSize: number, scale: number): string {
        // Example: scale = this.scale.width or this.scale.height
        const ratio = scale / 800; // 800 is your "base" design width (adjust as needed)
        return `${Math.floor(baseSize * ratio)}px`;
    }
}
