import type { ChestObject, PlayerObject } from "../backend/types";

export async function openChest(
    scene: Phaser.Scene,
    chest: ChestObject,
    player: PlayerObject,
): Promise<void> {
    function launchChestOverlay() {
        scene.scene.pause();
        scene.scene.launch('ChestOverlay', { 
            chestWeapon: chest.Weapon,
            playerWeapon: player.PrimaryWeapon,
            onPrimary: () => {
                const oldWeapon = player.PrimaryWeapon;
                player.PrimaryWeapon = chest.Weapon;
                chest.Weapon = oldWeapon;
                scene.scene.stop('ChestOverlay');
                scene.scene.resume();
            },
            onLeave: () => {
                scene.scene.stop('ChestOverlay');
                scene.scene.resume();
            }
        });

        return;
    }

    if (chest.Opened) {
        launchChestOverlay();
    }
    else {
        chest.SpriteObject!.anims.play('chest-open').on('animationcomplete', () => {;
            chest.Opened = true;
            launchChestOverlay();
            chest.SpriteObject!.setFrame(3);
        });
    }
}