import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/city-bg.png');
        this.load.audio("swing", "assets/audio/swing.ogg");
        this.load.audio("hit", "assets/audio/hit.ogg");
        this.load.audio("death", "assets/audio/death.ogg");
        this.load.audio("transition", "assets/audio/transition.ogg");
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
