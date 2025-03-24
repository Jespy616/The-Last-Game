import { Scene } from 'phaser';
import { PlayerHealthBar } from '../ui/PlayerHealthBar';
import type { PlayerObject } from '../backend/types';

export class Gui extends Scene {

    constructor() {
        super('Gui');
    }
    player: PlayerObject;
    playerHealthBar: PlayerHealthBar;

    init(data: PlayerObject) {
        this.player = data;
    }

    create() {
        // Create GUI elements here
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, this.cameras.main.height - 50, this.cameras.main.width, 50);

        // Example text
        this.add.text(10, this.cameras.main.height - 40, 'Health:', { fontSize: '16px', color: '#ffffff' });

        // Create health bar
        this.playerHealthBar = new PlayerHealthBar(this, 100, this.cameras.main.height - 45, this.player.currentHealth, this.player.maxHealth);
    }

    update(): void {
        this.playerHealthBar.updateHealth(this.player.currentHealth);
    }
}
