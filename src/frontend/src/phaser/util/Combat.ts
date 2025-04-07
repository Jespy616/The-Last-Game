import type { EnemyObject, PlayerObject } from "../backend/types";
const TURN_DELAY: number = 500;

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
        const damage = enemy.Damage;

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
        
        // console.log(`Player attacks ${enemy.SpriteObject!.texture.key} for ${damage} Damage`);
        enemy.CurrentHealth -= damage;
        
        setTimeout(() => resolve(true), TURN_DELAY); // Wait for attack animation to finish
    }); 
}