import { HealthBarBase } from "./HealthBarBase";

const OFFSET_X: number = -12;
const OFFSET_Y: number = 0;
const SIZE: number = 16;

export class EnemyHealthBar extends HealthBarBase {
    protected draw() {
        this.bar.clear();
        if (this.currentHealth === this.maxHealth) { return; }
        const healthPercentage = this.currentHealth / this.maxHealth;
        // Change color based on percent health
        const color = healthPercentage > 0.5 ? 0x00ff00 : healthPercentage > 0.25 ? 0xffff00 : 0xff0000;

        this.bar.fillStyle(color, 1);
        this.bar.fillRect(this.x, this.y, 3, SIZE * healthPercentage);
        this.bar.lineStyle(1, 0x000000);
        this.bar.strokeRect(this.x, this.y, 3, SIZE);

        // Draw dividing lines every 10 HP
        const numDivisions = Math.floor(this.maxHealth / 5);
        for (let i = 1; i < numDivisions; i++) {
            const divisionY = this.y + SIZE - (SIZE * (i * 5) / this.maxHealth);
            this.bar.lineBetween(this.x, divisionY, this.x + 3, divisionY);
        }
    }

    public updatePosition(x: number, y: number) {
        this.x = x + OFFSET_X;
        this.y = y + OFFSET_Y;
        this.draw();
    }
}