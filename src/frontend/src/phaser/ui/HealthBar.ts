const OFFSET_X: number = -12;
const OFFSET_Y: number = 4;
const SIZE: number = 8;

export class HealthBar {
    private bar: Phaser.GameObjects.Graphics;
    private x: number;
    private y: number;
    private maxHealth: number;
    private currentHealth: number;

    constructor(scene: Phaser.Scene, x: number, y: number, currentHealth: number, maxHealth: number) {
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.x = x + OFFSET_X;
        this.y = y + OFFSET_Y;
        this.currentHealth = currentHealth;
        this.maxHealth = maxHealth;
        scene.add.existing(this.bar);
        this.draw();
    }

    private draw() {
        this.bar.clear();
        const healthPercentage = this.currentHealth / this.maxHealth;
        // Change color based on percent health
        const color = healthPercentage > 0.5 ? 0x00ff00 : healthPercentage > 0.25 ? 0xffff00 : 0xff0000;

        this.bar.fillStyle(color, 1);
        this.bar.fillRect(this.x, this.y, 3, SIZE * healthPercentage);
        this.bar.lineStyle(1, 0x000000);
        this.bar.strokeRect(this.x, this.y, 3, SIZE);
    }

    public updateHealthBar(newHealth: number) {
        if (newHealth <= 0) { return this.destroy(); }
        this.currentHealth = newHealth;
        this.draw();
    }

    public setPosition(x: number, y: number) {
        this.x = x + OFFSET_X;
        this.y = y + OFFSET_Y;
        this.draw();
    }

    private destroy() {
        this.bar.destroy();
    }
}