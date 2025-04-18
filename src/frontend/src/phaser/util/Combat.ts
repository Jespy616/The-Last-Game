import type { EnemyObject, PlayerObject } from "../backend/types";
const TURN_DELAY: number = 1000;

function enemyIsInRange(enemy: EnemyObject, player: PlayerObject): boolean {
        return (Math.abs(player.PosX - enemy.PosX) <= 1 && Math.abs(player.PosY - enemy.PosY) === 0) || (Math.abs(player.PosY - enemy.PosY) <= 1 && Math.abs(player.PosX - enemy.PosX) === 0);
    }

export async function handleEnemyTurns(scene: Phaser.Scene, player: PlayerObject, enemies: EnemyObject[]) {
    // console.log('Enemy turn');

    for (const enemy of enemies) {
        if (enemyIsInRange(enemy, player)) {
            await enemyAttack(scene, enemy, player);
        }
    }
    // console.log('Player turn');
}

async function enemyAttack(scene: Phaser.Scene, enemy: EnemyObject, player: PlayerObject) {
    return new Promise(resolve => {
        const damage = enemy.Damage;
        enemy.SpriteObject!.anims.play(`${enemy.SpriteObject!.texture.key}-attack`);
        player.CurrentHealth -= damage;
        const swingSound = scene.sound.add("swing");
        swingSound.play();
        swingSound.once("complete", () => {
            if (player.CurrentHealth > 0) {
                const hitSound = scene.sound.add("hit", {volume: 0.3});
                hitSound.play();
            }
            else {
                const deathSound = scene.sound.add("death", {volume: 0.3});
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

export async function playerAttack(scene: Phaser.Scene, enemy: EnemyObject, player: PlayerObject) {
    // Player attacks the enemy
    return new Promise(resolve => {
        const damage = player.PrimaryWeapon.Damage;
        
        enemy.CurrentHealth -= damage;
        const swingSound = scene.sound.add("swing");
        swingSound.play();
        swingSound.once("complete", () => {
            if (enemy.CurrentHealth > 0) {
                const hitSound = scene.sound.add("hit", {volume: 0.3});
                hitSound.play();
            }
            else {
                const deathSound = scene.sound.add("death", {volume: 0.3});
                deathSound.play();
            }
        });        
        setTimeout(() => resolve(true), TURN_DELAY); // Wait for attack animation to finish
    }); 
}