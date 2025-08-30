# Duck Hunt Game 🦆🎯

A classic Duck Hunt game recreation built with Phaser.js for mouse and keyboard controls!

## 🎮 How to Play

- **Aim**: Move your mouse to aim the crosshair
- **Shoot**: Click the left mouse button to shoot
- **Reload**: Press the **Space** key to reload (get 3 more shots)
- **Restart**: Press **R** to restart the game

## 🎯 Game Rules

- **10 challenging levels** with increasing difficulty
- You have **3 shots** per level
- Hit ducks to score **100 points** each
- Must hit **50% or more** of the ducks in each level to progress
- Ducks fly faster and spawn more frequently in higher levels
- Ducks fly in different patterns: straight, wave, and diagonal

## 🚀 Setup & Development

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd duck-hunt-game
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎨 Features

- **10 Level Campaign**: Progressively challenging levels with increasing difficulty
- **Procedural Graphics**: All sprites are generated programmatically (no external image files needed)
- **Multiple Flight Patterns**: Ducks fly in straight lines, waves, or diagonal patterns
- **Visual Effects**: Muzzle flash, particle effects when ducks are hit, screen shake
- **Dynamic Difficulty**: Speed multipliers, duck counts, and spawn rates increase per level
- **Responsive Controls**: Both mouse and keyboard controls
- **Level Progression**: Must achieve 50% hit rate to advance to next level
- **Attractive UI**: Intro screen, level transitions, game over, and victory screens

## 🛠️ Project Structure

```
src/
├── main.js           # Game entry point and configuration
├── scenes/
│   ├── BootScene.js         # Asset loading and sprite generation
│   ├── IntroScene.js        # Title screen and main menu
│   ├── GameScene.js         # Main gameplay scene with level system
│   └── LevelTransitionScene.js # Level transitions, game over, victory
└── sprites/
    └── Duck.js       # Duck sprite class with physics and speed scaling
```

## 🎵 Game Mechanics

- **10-Level Campaign**: Each level has specific duck counts and speed multipliers
- **Success Criteria**: Must hit 50% or more ducks to advance to the next level
- **Duck AI**: Ducks have randomized flight patterns and occasionally change direction
- **Adaptive Difficulty**: Duck speed increases from 1.0x in Level 1 to 2.0x in Level 10
- **Progressive Challenge**: Duck counts increase from 1 in Level 1 to 6 in Level 10
- **Hit Detection**: Precise collision detection based on mouse click position
- **Physics**: Realistic falling animation when ducks are hit

## 🔧 Technologies Used

- **Phaser.js 3**: Game development framework
- **Vite**: Build tool and development server
- **JavaScript ES6+**: Modern JavaScript features
- **HTML5 Canvas**: Rendering engine

## 🎯 Future Enhancements

Possible additions you could make:
- Sound effects and background music
- Different duck types with varying point values
- Power-ups (rapid fire, larger crosshair, etc.)
- High score saving
- Multiple backgrounds/environments
- Mobile touch controls

## 🏆 Level Progression

| Level | Ducks | Speed | Challenge |
|-------|-------|-------|----------|
| 1     | 1     | 1.0x  | Tutorial |
| 2-3   | 2     | 1.1-1.2x | Easy |
| 4-5   | 3     | 1.3-1.4x | Medium |
| 6-7   | 4     | 1.5-1.6x | Hard |
| 8-9   | 5     | 1.7-1.8x | Expert |
| 10    | 6     | 2.0x  | Master |

Enjoy hunting those ducks through all 10 challenging levels! 🦆🏆
