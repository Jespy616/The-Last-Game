import { HealthBarBase } from "./HealthBarBase";
const WIDTH: number = 500;
const HEIGHT: number = 20;

export class PlayerHealthBar extends HealthBarBase {
    protected draw() {
        this.bar.clear();
        const healthPercentage = this.currentHealth / this.maxHealth;
        // Change color based on percent health
        const color = healthPercentage > 0.5 ? 0x00ff00 : healthPercentage > 0.25 ? 0xffff00 : 0xff0000;

        this.bar.fillStyle(color, 1);
        this.bar.fillRect(this.x, this.y, WIDTH * healthPercentage, HEIGHT);
        this.bar.lineStyle(1, 0x000000);
        this.bar.strokeRect(this.x, this.y, WIDTH, HEIGHT);

        // Draw dividing lines every 5 HP
        const numDivisions = Math.floor(this.maxHealth / 5);
        for (let i = 1; i < numDivisions; i++) {
            const divisionX = this.x + (WIDTH * (i * 5) / this.maxHealth);
            this.bar.lineBetween(divisionX, this.y, divisionX, this.y + HEIGHT);
        }
    }
}
