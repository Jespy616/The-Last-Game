import type { ChestObject, PlayerObject } from "../backend/types";

export function openChest(
    scene: Phaser.Scene,
    chest: ChestObject,
    player: PlayerObject,
): void {
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
    }
    if (chest.Opened) {
        launchChestOverlay();
        return;
    }
    else {
        chest.SpriteObject!.anims.play('chest-open').on('animationcomplete', () => {;
            chest.Opened = true;
            launchChestOverlay();
            chest.SpriteObject!.setFrame(3);
        });
    }
}