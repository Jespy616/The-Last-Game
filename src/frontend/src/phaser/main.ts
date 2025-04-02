import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Room } from './scenes/Room';
import { Gui } from './scenes/Gui';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { GridEngine } from 'grid-engine';
import { ThemeSelection } from './scenes/ThemeSelection';
import { DifficultySelection } from './scenes/DifficultySelection';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Room,
        Gui,
        GameOver,
        ThemeSelection,
        DifficultySelection
    ],
    plugins: {
        scene: [
          {
            key: "gridEngine",
            plugin: GridEngine,
            mapping: "gridEngine",
          }
        ],
    },
    pixelArt: true,
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });
    
}

export default StartGame;
