export abstract class HealthBarBase {
    protected bar: Phaser.GameObjects.Graphics;
    protected x: number;
    protected y: number;
    protected MaxHealth: number;
    protected CurrentHealth: number;
    protected scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, CurrentHealth: number, MaxHealth: number) {
        this.scene = scene;
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.x = x;
        this.y = y;
        this.CurrentHealth = CurrentHealth;
        this.MaxHealth = MaxHealth;
        scene.add.existing(this.bar);
    }

    protected abstract draw(): void;

    public updateHealth(newHealth: number): void {
        if (newHealth <= 0) { return this.destroy(); }
        const healthChange = newHealth - this.CurrentHealth;
        this.CurrentHealth = newHealth;
        this.draw();
        if (healthChange !== 0) {
            this.showHealthChange(healthChange);
        }
    }

    private showHealthChange(amount: number) {
        const color = amount > 0 ? '#ffffff' : '#ff0000';
        const text = this.scene.add.text(this.x, this.y - 10, `${amount > 0 ? '+' : ''}${amount}`, {
            fontSize: '24px',
            color: color,
        }).setOrigin(0.5);
        text.scale = 0.25;

        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            duration: 1250,
            ease: 'Power1',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    protected destroy(): void {
        this.bar.destroy();
    }
}