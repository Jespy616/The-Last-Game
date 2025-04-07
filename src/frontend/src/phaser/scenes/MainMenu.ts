import { type GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    logo!: GameObjects.Image;
    title!: GameObjects.Text;
    logoTween!: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        let { width, height } = this.scale;
        this.background = this.add.image(width / 2, height / 2, 'background');

        // this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        const startGame = this.title = this.add.text(width / 2 , height / 2, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        startGame.setInteractive({ useHandCursor: true });
        startGame.on('pointerover', () => startGame.setColor('#48DDD4'));
        startGame.on('pointerout', () => startGame.setColor('#ffffff'));

        startGame.on('pointerdown', () => {
            this.scene.launch('Transition', { prevSceneKey: 'MainMenu', nextSceneKey: 'ThemeSelection', nextSceneData: {} }); // Use prevSceneKey
        });

        EventBus.emit('current-scene-ready', this);
    }
}
