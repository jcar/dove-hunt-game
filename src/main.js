import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene.js';
import GameScene from './scenes/GameScene.js';
import LevelTransitionScene from './scenes/LevelTransitionScene.js';
import BootScene from './scenes/BootScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB', // Sky blue
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, IntroScene, GameScene, LevelTransitionScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Make game globally accessible for debugging
window.game = game;

export default game;
