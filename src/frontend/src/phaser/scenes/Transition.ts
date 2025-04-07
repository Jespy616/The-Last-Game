import Phaser from 'phaser';

export class Transition extends Phaser.Scene {
    private prevSceneKey!: string;
    private nextSceneKey!: string;
    private nextSceneData!: any;
    private transitionRect!: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: 'Transition' });
    }

    init(data: { prevSceneKey: string; nextSceneKey: string; nextSceneData?: any }) {
        this.prevSceneKey = data.prevSceneKey;
        this.nextSceneKey = data.nextSceneKey;
        this.nextSceneData = data.nextSceneData || {};
    }

    create() {
        const { width, height } = this.scale;

        // Create a full-screen black rectangle
        this.transitionRect = this.add.rectangle(0, 0, width, height, 0x000000, 1)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(1000);

        // Fade in to cover the screen
        this.tweens.add({
            targets: this.transitionRect,
            alpha: 1,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                // Stop the previous scene and start the next scene
                const prevScene = this.scene.get(this.prevSceneKey);
                if (prevScene) {
                    prevScene.scene.stop();
                }
                this.scene.start(this.nextSceneKey, this.nextSceneData);

                // Fade out the overlay
                this.tweens.add({
                    targets: this.transitionRect,
                    alpha: 0,
                    duration: 500,
                    ease: 'Linear',
                    onComplete: () => {
                        this.scene.stop(); // Remove overlay after transition
                    }
                });
            }
        });
    }
}
