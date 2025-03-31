import type { EnemyObject, PlayerObject } from "../backend/types";
const TURN_DELAY: number = 500;

function enemyIsInRange(enemy: EnemyObject, player: PlayerObject): boolean {
        return (Math.abs(player.posX - enemy.posX) <= 1 && Math.abs(player.posY - enemy.posY) === 0) || (Math.abs(player.posY - enemy.posY) <= 1 && Math.abs(player.posX - enemy.posX) === 0);
    }

export async function handleEnemyTurns(player: PlayerObject, enemies: EnemyObject[]) {
    console.log('Enemy turn');

    for (const enemy of enemies) {
        if (enemyIsInRange(enemy, player)) {
            await enemyAttack(enemy, player);
        }
    }
    console.log('Player turn');
}

async function enemyAttack(enemy: EnemyObject, player: PlayerObject) {
    return new Promise(resolve => {
        const damage = enemy.damage;

        enemy.spriteObject!.anims.play(`${enemy.spriteObject!.texture.key}-attack`);
        player.currentHealth -= damage;
        console.log(`${enemy.spriteObject!.texture.key} attacks player for ${damage} damage`);
        setTimeout(() => resolve(true), TURN_DELAY); // Wait for attack animation to finish
    }).then(() => {
        try {
            enemy.spriteObject!.anims.play(`${enemy.spriteObject!.texture.key}-idle`);
        } catch (e) {
            // Harmless error if the enemy is already dead
        }
    });
}

export async function playerAttack(enemy: EnemyObject, player: PlayerObject) {
    // Player attacks the enemy
    return new Promise(resolve => {
        const damage = player.primaryWeapon.damage;
        
        console.log(`Player attacks ${enemy.spriteObject!.texture.key} for ${damage} damage`);
        enemy.currentHealth -= damage;
        
        setTimeout(() => resolve(true), TURN_DELAY); // Wait for attack animation to finish
    }); 
}