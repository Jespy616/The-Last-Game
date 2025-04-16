import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Room } from './scenes/Room';
import { Gui } from './scenes/Gui';
import { MainMenu } from './scenes/MainMenu';
import { Game } from 'phaser';
import { SettingsOverlay } from './scenes/SettingsOverlay';
import { Overview } from './scenes/Overview';
import { GridEngine } from 'grid-engine';
import { ThemeSelection } from './scenes/ThemeSelection';
import { DifficultySelection } from './scenes/DifficultySelection';
import { MusicManager } from './scenes/MusicManager';
import { StoryText } from './scenes/StoryText';
import { Loader } from './scenes/Loader';
import { Transition } from './scenes/Transition';
import { ChestOverlay } from './scenes/ChestOverlay';

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
        Overview,
        Room,
        SettingsOverlay,
        Gui,
        GameOver,
        ThemeSelection,
        DifficultySelection,
        MusicManager,
        StoryText,
        Loader,
        Transition,
        ChestOverlay,
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
