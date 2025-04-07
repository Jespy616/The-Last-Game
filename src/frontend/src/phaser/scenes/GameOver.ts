import type { GameObject } from '../backend/types';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { formatButton } from '../ui/FormatButton';

export class GameOver extends Scene
{
    camera!: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.Image;
    level!: number;

    constructor ()
    {
        super('GameOver');
    }

    init (data: {gameData: GameObject}) {
        // Initialize any data needed from the gameData
        this.level = data.gameData.Floor.Level;
    }

    preload () {
        this.load.image('menu', 'assets/menu-border.png')
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x000000);

        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menu')
            .setOrigin(0.5)
            .setDisplaySize(.65 * this.scale.width, .5 * this.scale.height)

        this.add.text(this.scale.width / 2, .4 * this.scale.height, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5)

        this.add.text(this.scale.width / 2, .5 * this.scale.height, `Floor Reached:\n${this.level}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5)

        const mainMenuButton = this.add.text(this.scale.width / 2, .6 * this.scale.height, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5)
            .on('pointerdown', () => this.scene.start('MainMenu'))
            
        formatButton(mainMenuButton)
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
