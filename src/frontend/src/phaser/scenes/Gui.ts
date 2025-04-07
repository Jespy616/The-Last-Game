import { Scene } from 'phaser';
import { PlayerHealthBar } from '../ui/PlayerHealthBar';
import type { PlayerObject } from '../backend/types';

export class Gui extends Scene {

    constructor() {
        super('Gui');
    }
    player!: PlayerObject;
    playerHealthBar!: PlayerHealthBar;

    init(data: PlayerObject) {
        this.player = data;
        this.playerHealthBar = new PlayerHealthBar(this, 100, this.cameras.main.height - 45, this.player.CurrentHealth, this.player.MaxHealth);
    }

    create() {
        // Create GUI elements here
        this.add.graphics()
            .fillStyle(0x000000, 0.5)
            .fillRect(0, this.cameras.main.height - 100, this.cameras.main.width, 100)
            .setDepth(-1);

        // Example text
        this.add.text(10, this.cameras.main.height - 40, 'Health:', { fontSize: '16px', color: '#ffffff' });

    }

    update(): void {
        this.playerHealthBar.updateHealth(this.player.CurrentHealth);
    }
}
