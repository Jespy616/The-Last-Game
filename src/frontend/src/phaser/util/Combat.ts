import type { EnemyObject, PlayerObject } from "../backend/types";
const TURN_DELAY: number = 1000;

function enemyIsInRange(enemy: EnemyObject, player: PlayerObject): boolean {
        return (Math.abs(player.PosX - enemy.PosX) <= 1 && Math.abs(player.PosY - enemy.PosY) === 0) || (Math.abs(player.PosY - enemy.PosY) <= 1 && Math.abs(player.PosX - enemy.PosX) === 0);
    }

export async function handleEnemyTurns(player: PlayerObject, enemies: EnemyObject[]) {
    // console.log('Enemy turn');

    for (const enemy of enemies) {
        if (enemyIsInRange(enemy, player)) {
            await enemyAttack(enemy, player);
        }
    }
    // console.log('Player turn');
}

async function enemyAttack(enemy: EnemyObject, player: PlayerObject) {
    return new Promise(resolve => {
        const damage = enemy.damage;
        enemy.spriteObject!.anims.play(`${enemy.spriteObject!.texture.key}-attack`);
        player.currentHealth -= damage;
        const swingSound = enemy.spriteObject!.scene.sound.add("swing");
        swingSound.play();
        swingSound.once("complete", () => {
            if (player.currentHealth > 0) {
                const hitSound = player.spriteObject!.scene.sound.add("hit", {volume: 0.3});
                hitSound.play();
            }
            else {
                const deathSound = player.spriteObject!.scene.sound.add("death", {volume: 0.25});
                deathSound.play();
            }
        });

        enemy.SpriteObject!.anims.play(`${enemy.SpriteObject!.texture.key}-attack`);
        player.CurrentHealth -= damage;
        // console.log(`${enemy.SpriteObject!.texture.key} attacks player for ${damage} Damage`);
        setTimeout(() => resolve(true), TURN_DELAY); // Wait for attack animation to finish
    }).then(() => {
        try {
            enemy.SpriteObject!.anims.play(`${enemy.SpriteObject!.texture.key}-idle`);
        } catch (e) {
            // Harmless error if the enemy is already dead
        }
    });
}

export async function playerAttack(enemy: EnemyObject, player: PlayerObject) {
    // Player attacks the enemy
    return new Promise(resolve => {
        const damage = player.PrimaryWeapon.Damage;
        
        enemy.currentHealth -= damage;
        const swingSound = player.spriteObject!.scene.sound.add("swing");
        swingSound.play();
        swingSound.once("complete", () => {
            if (enemy.currentHealth > 0) {
                const hitSound = player.spriteObject!.scene.sound.add("hit", {volume: 0.3});
                hitSound.play();
            }
            else {
                const deathSound = player.spriteObject!.scene.sound.add("death", {volume: 0.25});
                deathSound.play();
            }
        });
        // console.log(`Player attacks ${enemy.SpriteObject!.texture.key} for ${damage} Damage`);
        
        setTimeout(() => resolve(true), TURN_DELAY); // Wait for attack animation to finish
    }); 
}