import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Room } from './scenes/Room';
import { Gui } from './scenes/Gui';
import { MainMenu } from './scenes/MainMenu';
import { Game } from 'phaser';
import { SettingsOverlay } from './scenes/SettingsOverlay';
import { GridEngine } from 'grid-engine';
import { ThemeSelection } from './scenes/ThemeSelection';
import { DifficultySelection } from './scenes/DifficultySelection';
import { StoryText } from './scenes/StoryText';
import { Loader } from './scenes/Loader';
import { Transition } from './scenes/Transition';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [
        Boot,
        MainMenu,
        Room,
        SettingsOverlay,
        Gui,
        GameOver,
        ThemeSelection,
        DifficultySelection,
        StoryText,
        Loader,
        Transition
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
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });
    
}

export default StartGame;
