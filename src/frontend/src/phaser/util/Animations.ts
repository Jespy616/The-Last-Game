let anims: string[] = []

export const createPlayerAnimation = (
    scene: Phaser.Scene,
    name: string,
    startFrame: number,
    endFrame: number
): void => {
    scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers('player', { start: startFrame, end: endFrame }),
        frameRate: 5,
        repeat: 0,
    });
    anims.push(name);
}

export const createEnemyAnimation = (
    scene: Phaser.Scene,
    id: number,
    action: 'attack' | 'idle' | 'walk'
): void => {
    let startFrame = 0;
    let endFrame = 0;
    let repeat = -1;
    let yoyo = false;

    switch (action) {
        case 'attack':
            startFrame = 4;
            endFrame = 6;
            repeat = 0;
            yoyo = true;
            break;
        case 'idle':
            startFrame = 0;
            endFrame = 3;
            break;
        default:
            startFrame = 4;
            endFrame = 7;
    }

    scene.anims.create({
        key: `enemy${id}-${action}`,
        frames: scene.anims.generateFrameNumbers(`enemy${id}`, {
            start: startFrame,
            end: endFrame,
        }),
        frameRate: 10,
        repeat: repeat,
        yoyo: yoyo,
    });
    anims.push(`enemy${id}-${action}`);
}

export const destroyAnimations = (scene: Phaser.Scene) => {
    scene.anims.pauseAll();
    anims.forEach(anim =>{
        scene.anims.remove(anim)
    });
    anims = [];
}