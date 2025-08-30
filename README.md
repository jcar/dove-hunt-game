# Dove Hunt 🕊️🎯

A dove hunting game that starts easy and gets crazy fast. Built this with Phaser.js to capture the feel of those early morning dove shoots.

## 🎮 Controls

- **Aim**: Move your mouse around
- **Shoot**: Click to fire
- **Reload**: Hit spacebar when you run out of shells
- **Restart**: Press R if you want to start over

## 🎯 How It Works

- **25 levels** that progress from easy single birds to absolute chaos
- Shot count scales with bird count - you get 3 shots per 2 birds (so 6 birds = 9 shots)
- Score increases with level difficulty and accuracy
- Hit **all the birds** in a level to advance
- White doves are worth 3x points but they're smaller and faster
- Birds get faster and fly in groups as you progress

## 🚀 Setup & Development

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
git clone https://github.com/jcar/dove-hunt-game.git
cd dove-hunt-game
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎨 What's Cool About It

- **25 levels** that actually feel different - starts with calm morning doves, ends with flock chaos
- **No image files** - everything's drawn with code so it loads instantly
- **Realistic progression** - mimics how real dove hunting gets intense when you spook a whole field
- **Group flying** - birds fly in formations and split apart mid-flight
- **White dove bonus birds** - rare, fast, worth triple points
- **Smart difficulty** - more birds means more shots, but they're harder to hit
- **Clean interface** - just you, the birds, and your score

## 🛠️ Project Structure

```
src/
├── main.js              # Game setup
├── scenes/
│   ├── BootScene.js     # Loading screen
│   ├── IntroScene.js    # Title screen
│   ├── GameScene.js     # Main game
│   └── LevelTransitionScene.js # Between levels
├── sprites/
│   └── Dove.js          # Bird behavior and animations
└── audio/
    └── SimpleAudioManager.js # Sound effects
```

## 🎯 The Progression

**Learning the Flight (Levels 1-5)**
Single birds, slow and predictable. Like shooting doves off a fence post.

**Quick Flutters (Levels 6-10)**
Pairs of birds, faster movement. They're flushing from the tree line now.

**Erratic Scatters (Levels 11-15)**
Small groups, unpredictable flight. You spooked the flock.

**Flock & Frenzy (Levels 16-20)**
Large groups, very fast. Full sunflower field chaos.

**Expert Mastery (Levels 21-25)**
Massive flocks with mixed speeds. Some slow floaters, some lightning fast. Good luck.

White doves start showing up around level 6 - they're worth hunting but harder to hit.

## 🔧 Built With

- **Phaser.js 3** for the game engine
- **Vite** for fast development and building
- **Vanilla JavaScript** - no fancy frameworks needed
- **Web Audio API** for the sound effects

## 🚀 Ideas for Later

- Different environments (field edges, sunflower fields, stock tanks)
- Weather effects (wind affecting flight patterns)
- Time of day progression
- Different dove species with unique behaviors
- Decoy placement strategy
- Shell type selection (different spread patterns)

## 🏆 Level Breakdown

| Levels | Birds | Speed | What It Feels Like |
|--------|-------|-------|--------------------|
| 1-5    | 1-2   | 0.9-1.3x | Morning perch shots |
| 6-10   | 2     | 1.4-2.0x | Tree line flush |
| 11-15  | 2-4   | 1.9-2.3x | Scattered flock |
| 16-20  | 3-5   | 2.4-3.0x | Field chaos |
| 21-25  | 5-8   | 2.9-3.2x+ | Total mayhem |

If you make it past level 20, you're either really good or really lucky. 🕊️

---

*Built this because I missed those September dove shoots. The real thing's better, but this scratches the itch.*
