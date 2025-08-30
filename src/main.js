import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene.js';
import GameScene from './scenes/GameScene.js';
import LevelTransitionScene from './scenes/LevelTransitionScene.js';
import BootScene from './scenes/BootScene.js';

// Dynamic game sizing based on device
function getGameDimensions() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth <= 768;
    
    if (isMobile) {
        // Mobile dimensions - optimize for portrait and landscape
        const isPortrait = screenHeight > screenWidth;
        
        if (isPortrait) {
            // Portrait mode - adjust to fit screen better
            return {
                width: Math.min(screenWidth * 0.95, 480),
                height: Math.min(screenHeight * 0.8, 640)
            };
        } else {
            // Landscape mode - use more horizontal space
            return {
                width: Math.min(screenWidth * 0.9, 800),
                height: Math.min(screenHeight * 0.85, 500)
            };
        }
    } else {
        // Desktop - original dimensions
        return {
            width: 800,
            height: 600
        };
    }
}

const gameDimensions = getGameDimensions();

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: gameDimensions.width,
    height: gameDimensions.height,
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
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameDimensions.width,
        height: gameDimensions.height
    },
    input: {
        activePointers: 3 // Enable multi-touch for mobile
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Handle window resize and orientation changes
function handleResize() {
    const newDimensions = getGameDimensions();
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Update game scale for mobile
        game.scale.resize(newDimensions.width, newDimensions.height);
        game.scale.setGameSize(newDimensions.width, newDimensions.height);
    }
}

// Add resize event listeners
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(handleResize, 100);
});

window.addEventListener('orientationchange', () => {
    // Wait for orientation change to complete
    setTimeout(handleResize, 500);
});

// Make game globally accessible for debugging
window.game = game;

export default game;
