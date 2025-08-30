import Phaser from 'phaser';
import Dove from '../sprites/Dove.js';
import SimpleAudioManager from '../audio/SimpleAudioManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.score = 0;
        this.dovesHit = 0;
        this.totalDovesHit = 0;
        this.shotsLeft = 3;
        this.doves = [];
        this.level = 1;
        this.levelConfig = null;
        this.dovesSpawned = 0;
        this.dovesRequired = 0;
        this.levelStartTime = 0;
        
        // Detailed game statistics tracking
        this.gameStats = {
            totalShots: 0,
            totalDoves: 0,
            totalScore: 0,
            firstShotHits: 0,
            secondShotHits: 0,
            thirdShotHits: 0,
            perfectLevels: 0,
            bonusPoints: 0
        };
    }

    init(data) {
        // Initialize with data from previous level or start fresh
        this.level = data.level || 1;
        this.score = data.score || 0;
        this.totalDovesHit = data.dovesHit || 0;
        this.dovesHit = 0; // Reset for current level
        this.levelConfig = this.getLevelConfig(this.level);
        this.dovesRequired = this.levelConfig.doveCount;
        this.shotsLeft = this.levelConfig.shotsPerRound;
        this.levelCompleting = false; // Reset completion flag for new level
        
        // Preserve game stats from previous levels or initialize fresh
        if (data.gameStats) {
            this.gameStats = data.gameStats;
        }
        
    }

    create() {
        // Detect mobile device
        this.isMobile = window.innerWidth <= 768;
        const { width, height } = this.cameras.main;
        
        // Sky background is already set in main config
        
        // Add trees in background
        this.createTrees();
        
        // Add grass at the bottom - scale based on screen size
        const grassY = height - 50;
        this.grass = this.add.image(width / 2, grassY, 'grass');
        this.grass.setDisplaySize(width, 100);
        
        // Level indicator - adjust size and position for mobile
        const levelFontSize = this.isMobile ? '18px' : '24px';
        const scoreFontSize = this.isMobile ? '16px' : '20px';
        const levelX = this.isMobile ? width / 2 : 20;
        const levelY = this.isMobile ? 15 : 20;
        const scoreY = this.isMobile ? 35 : 45;
        
        this.levelText = this.add.text(levelX, levelY, `LEVEL ${this.level}`, {
            fontSize: levelFontSize,
            fill: '#FFD700',
            fontFamily: 'Arial Bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Score display under level indicator
        this.scoreText = this.add.text(levelX, scoreY, `SCORE: ${this.score}`, {
            fontSize: scoreFontSize,
            fill: '#00FF00',
            fontFamily: 'Arial Bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        if (this.isMobile) {
            this.levelText.setOrigin(0.5, 0);
            this.scoreText.setOrigin(0.5, 0);
        }
        
        this.levelText.setDepth(1000);
        this.scoreText.setDepth(1000);
        
        // Set up input
        this.setupInput();
        
        // Create dove group
        this.doveGroup = this.physics.add.group();
        
        // Initialize level
        this.dovesSpawned = 0;
        this.levelStartTime = this.time.now;
        
        // Start level
        this.startLevel();
        
        // Initialize audio system immediately (singleton)
        this.audioManager = SimpleAudioManager.getInstance(this);
        this.audioManager.init();
        this.audioManager.startMusic();
        
        // Update HTML UI
        this.updateUI();
    }

    createTrees() {
        const { width, height } = this.cameras.main;
        const treeScale = this.isMobile ? 0.6 : 1.0;
        
        // Position trees relative to screen size
        const leftTreesX = width * 0.125; // 12.5% from left
        const rightTreesX = width * 0.875; // 87.5% from left
        const treeY = height - 80;
        
        // Add some background trees
        this.add.image(leftTreesX, treeY, 'tree').setScale(1.5 * treeScale);
        this.add.image(rightTreesX, treeY - 10, 'tree').setScale(1.2 * treeScale);
        this.add.image(leftTreesX - 50, treeY + 10, 'tree').setScale(0.8 * treeScale);
        this.add.image(rightTreesX + 50, treeY + 5, 'tree').setScale(1.0 * treeScale);
    }

    setupInput() {
        // Mouse/pointer input - just handle shooting, no crosshair tracking needed
        this.input.on('pointerdown', (pointer) => {
            this.shoot(pointer);
        });

        // Keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C); // Cheat key

        // Handle key presses
        this.spaceKey.on('down', () => {
            this.reload();
        });

        this.rKey.on('down', () => {
            this.restartGame();
        });
        
        // Temporary cheat key to see final score screen
        this.cKey.on('down', () => {
            console.log('CHEAT: Jumping to final score screen');
            // Simulate completing the game with some stats
            this.gameStats.totalShots = 25;
            this.gameStats.totalDoves = 18;
            this.gameStats.firstShotHits = 8;
            this.gameStats.secondShotHits = 6;
            this.gameStats.thirdShotHits = 4;
            this.gameStats.perfectLevels = 3;
            this.gameStats.bonusPoints = 5000;
            this.score = 15000;
            this.totalDovesHit = 18;
            
            this.scene.start('LevelTransitionScene', {
                level: 10,
                score: this.score,
                dovesHit: this.totalDovesHit,
                gameStats: this.gameStats,
                isGameComplete: true
            });
        });
    }

    startLevel() {
        // Clear any existing doves
        this.doveGroup.clear(true, true);
        this.doves = [];
        
        // Show level start message
        this.showLevelStart();
        
        // Start spawning ducks after a brief delay
        this.time.delayedCall(2000, () => {
            this.spawnDoves();
        });
        
        this.updateUI();
    }

    showLevelStart() {
        const levelStartText = this.add.text(400, 300, `LEVEL ${this.level}\nREADY!`, {
            fontSize: '36px',
            fill: '#FFD700',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        levelStartText.setOrigin(0.5);
        levelStartText.setDepth(1000);
        
        // Animate and remove
        this.tweens.add({
            targets: levelStartText,
            alpha: 0,
            scale: 1.5,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                levelStartText.destroy();
            }
        });
    }

    spawnDoves() {
        // Use the new spawn delay from level config
        const spawnInterval = this.levelConfig.spawnDelay;
        
        // Spawn doves over time
        this.doveSpawnTimer = this.time.addEvent({
            delay: spawnInterval,
            callback: () => {
                if (this.dovesSpawned < this.dovesRequired) {
                    this.spawnDoveGroup();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Spawn first dove/group immediately
        this.spawnDoveGroup();
    }

    spawnDoveGroup() {
        if (this.dovesSpawned >= this.dovesRequired) {
            return;
        }
        
        // Determine if this should be a group spawn
        const shouldSpawnGroup = Math.random() < this.levelConfig.groupSpawnChance;
        const remainingDoves = this.dovesRequired - this.dovesSpawned;
        
        // Determine group size (1 for single, or 2-4 for groups based on level)
        let groupSize;
        if (!shouldSpawnGroup || remainingDoves === 1) {
            groupSize = 1;
        } else {
            groupSize = Math.min(remainingDoves, Phaser.Math.Between(2, Math.min(4, this.levelConfig.doveCount)));
        }
        
        // Spawn the group
        const groupStartY = Phaser.Math.Between(100, 400);
        
        for (let i = 0; i < groupSize; i++) {
            if (this.dovesSpawned >= this.dovesRequired) break;
            
            // Determine if this dove should be white
            const isWhiteDove = Math.random() < this.levelConfig.whiteDoveChance;
            
            // Position doves in formation for groups
            const startX = -50 - (i * 30); // Stagger horizontally
            const startY = groupSize > 1 ? groupStartY + (i * 20) - ((groupSize - 1) * 10) : groupStartY; // Stagger vertically
            
            const dove = new Dove(this, startX, startY, this.levelConfig.speedMultiplier, this.level, isWhiteDove, {
                groupId: this.dovesSpawned,
                groupSize: groupSize,
                groupIndex: i
            });
            
            this.doves.push(dove);
            this.doveGroup.add(dove);
            this.dovesSpawned++;
        }
        
        this.updateUI();
    }

    shoot(pointer) {
        if (this.shotsLeft <= 0) {
            return;
        }

        this.shotsLeft--;
        this.gameStats.totalShots++;
        this.updateUI();

        // Play shot sound
        if (this.audioManager) {
            this.audioManager.playShot();
        }

        // Create muzzle flash effect
        this.createMuzzleFlash(pointer.x, pointer.y);

        // Check for hit
        let hit = false;
        this.doves.forEach((dove, index) => {
            if (dove.active && dove.checkHit(pointer.x, pointer.y)) {
                dove.hit();
                
                // Track accuracy statistics - calculate BEFORE we decremented shotsLeft
                const shotsUsed = this.levelConfig.shotsPerRound - this.shotsLeft; // shotsLeft was already decremented above
                
                if (shotsUsed === 1) {
                    this.gameStats.firstShotHits++;
                } else if (shotsUsed === 2) {
                    this.gameStats.secondShotHits++;
                } else if (shotsUsed === 3) {
                    this.gameStats.thirdShotHits++;
                }
                
                // Calculate score based on accuracy and level difficulty
                const baseScore = this.calculateHitScore(dove.isWhiteDove);
                this.score += baseScore;
                this.dovesHit++;
                this.gameStats.totalDoves++;
                hit = true;
                
                // Don't remove dove from array immediately - let it fall and then get cleaned up naturally
            }
        });

        this.updateUI();

        // Check level completion
        this.time.delayedCall(100, () => {
            this.checkLevelEnd();
        });
    }

    createMuzzleFlash(x, y) {
        const flash = this.add.graphics();
        flash.fillStyle(0xFFFF00, 0.8);
        flash.fillCircle(x, y, 21); // Reduced to account for 1.5x scaling (21 * 1.5 = 31.5 ≈ 32)
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5, // Expands to show final hit radius
            duration: 150, // Slightly longer duration
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    reload() {
        this.shotsLeft = this.levelConfig.shotsPerRound; // Use dynamic shots per round
        this.updateUI();
    }

    checkLevelEnd() {
        // Don't check anything if we're already completing the level
        if (this.levelCompleting) {
            return;
        }
        
        // Check if all doves have been spawned and none are active
        const activeDoves = this.doves.filter(dove => dove.active);
        const allDovesSpawned = this.dovesSpawned >= this.dovesRequired;
        
        // Priority 1: Check if we've hit all required doves (success condition)
        if (this.dovesHit >= this.dovesRequired) {
            // Level success! Complete regardless of shots left or active doves
            this.levelCompleting = true;
            
            // Wait 3 seconds to let dove fall animations play and player celebrate
            this.time.delayedCall(3000, () => {
                this.completeLevel();
            });
            return;
        }
        
        // Priority 2: Check if all doves spawned and none active (also success if we hit enough)
        if (allDovesSpawned && activeDoves.length === 0) {
            // All doves gone - complete the level
            this.levelCompleting = true;
            
            // Wait 3 seconds to let dove fall animations play and player celebrate
            this.time.delayedCall(3000, () => {
                this.completeLevel();
            });
            return;
        }
        
        // Priority 3: Only check for game over if we're out of shots AND have active doves AND haven't hit enough
        if (this.shotsLeft <= 0 && activeDoves.length > 0 && this.dovesHit < this.dovesRequired) {
            // Game over - ran out of shots with doves still active and didn't hit enough
            this.levelCompleting = true;
            // Also add a small delay for game over to let final shot animation play
            this.time.delayedCall(1500, () => {
                this.gameOver();
            });
        }
    }

    completeLevel() {
        // Stop dove spawning
        if (this.doveSpawnTimer) {
            this.doveSpawnTimer.destroy();
        }
        
        // Calculate success - must hit ALL doves to progress to next level
        const success = this.dovesHit === this.dovesRequired;
        
        // Calculate level completion bonuses
        const bonusScore = success ? this.calculateLevelBonus() : 0;
        if (success) {
            this.score += bonusScore;
        }
        
        this.totalDovesHit += this.dovesHit;
        
        if (success) {
            if (this.level >= 25) {
                // Game complete! Calculate final bonus and statistics
                if (this.dovesHit === this.dovesRequired) {
                    this.gameStats.perfectLevels++;
                }
                this.gameStats.bonusPoints += bonusScore;
                this.gameStats.totalScore = this.score;
                
                this.scene.start('LevelTransitionScene', {
                    level: this.level,
                    score: this.score,
                    dovesHit: this.totalDovesHit,
                    gameStats: this.gameStats,
                    isGameComplete: true
                });
            } else {
                // Next level
                if (this.dovesHit === this.dovesRequired) {
                    this.gameStats.perfectLevels++;
                }
                this.gameStats.bonusPoints += bonusScore;
                
                this.scene.start('LevelTransitionScene', {
                    level: this.level + 1,
                    score: this.score,
                    dovesHit: this.totalDovesHit,
                    gameStats: this.gameStats
                });
            }
        } else {
            // Failed level - game over
            this.gameOver();
        }
    }
    
    gameOver() {
        // Stop dove spawning
        if (this.doveSpawnTimer) {
            this.doveSpawnTimer.destroy();
        }
        
        // Pass gameStats to game over screen for detailed breakdown
        this.gameStats.totalScore = this.score;
        
        this.scene.start('LevelTransitionScene', {
            level: this.level,
            score: this.score,
            dovesHit: this.totalDovesHit,
            gameStats: this.gameStats,
            isGameOver: true
        });
    }

    restartGame() {
        // Return to intro scene
        this.scene.start('IntroScene');
    }
    
    calculateHitScore(isWhiteDove = false) {
        // Base score increases with level difficulty
        let baseScore = 100 + (this.level * 25); // 125 pts level 1, up to 725 pts level 25
        
        // White dove bonus - worth 3x more points and smaller/faster
        if (isWhiteDove) {
            baseScore *= 3; // Triple points for white doves
        }
        
        // Accuracy bonus based on shots remaining
        let accuracyMultiplier = 1.0;
        const shotsUsed = this.levelConfig.shotsPerRound - this.shotsLeft;
        
        if (shotsUsed === 1) {
            // First shot hit - excellent accuracy!
            accuracyMultiplier = 2.0; // Double points
        } else if (shotsUsed === 2) {
            // Second shot hit - good accuracy
            accuracyMultiplier = 1.5; // 50% bonus
        }
        // Third shot gets no bonus (1.0x)
        
        return Math.round(baseScore * accuracyMultiplier);
    }
    
    calculateLevelBonus() {
        const shotsUsed = this.levelConfig.shotsPerRound - this.shotsLeft;
        const perfectAccuracy = this.dovesHit === this.dovesRequired;
        
        let bonus = 0;
        
        // Perfect accuracy bonus
        if (perfectAccuracy) {
            bonus += 500 + (this.level * 50); // 550 pts level 1, up to 1750 pts level 25
        }
        
        // Efficiency bonus for unused shots
        if (perfectAccuracy && this.shotsLeft > 0) {
            const efficiency = this.shotsLeft; // Number of unused shots
            bonus += efficiency * 250 * this.level; // 250-2500 per unused shot depending on level
        }
        
        // Speed bonus (complete level quickly)
        const levelDuration = (this.time.now - this.levelStartTime) / 1000; // seconds
        if (levelDuration < 10) {
            // Bonus for completing level in under 10 seconds
            const speedBonus = Math.max(0, (10 - levelDuration) * 100 * this.level);
            bonus += Math.round(speedBonus);
        }
        
        return bonus;
    }
    
    getLevelConfig(level) {
        // Progressive difficulty system based on your specification
        
        // 🌱 Levels 1–5: Learning the Flight
        if (level <= 5) {
            const doveCount = level <= 2 ? 1 : 2; // Single dove for first two levels, then pairs
            return {
                doveCount: doveCount,
                speedMultiplier: 0.8 + (level * 0.1), // 0.9 to 1.3 - slow, floating takeoffs
                shotsPerRound: Math.ceil(doveCount * 1.5), // 3 shots per 2 birds (1.5x)
                groupSpawnChance: level >= 3 ? 0.3 : 0, // 30% chance of pairs from level 3+
                whiteDoveChance: 0, // No white doves in learning levels
                spawnDelay: 3000 - (level * 200), // 3s to 2s spawn intervals
                description: "Learning the Flight - Calm morning doves"
            };
        }
        
        // 🌿 Levels 6–10: Quick Flutters  
        else if (level <= 10) {
            const doveCount = 2;
            return {
                doveCount: doveCount,
                speedMultiplier: 1.2 + ((level - 5) * 0.15), // 1.35 to 1.95 - faster with bursts
                shotsPerRound: Math.ceil(doveCount * 1.5), // 3 shots per 2 birds (1.5x)
                groupSpawnChance: 0.6, // 60% chance of doubles
                whiteDoveChance: 0.05, // 5% chance of white dove
                spawnDelay: 2000 - ((level - 5) * 100), // 2s to 1.5s intervals
                description: "Quick Flutters - Doves flushing from tree line"
            };
        }
        
        // 🌾 Levels 11–15: Erratic Scatters
        else if (level <= 15) {
            const doveCount = 2 + Math.floor((level - 10) / 2); // 2-4 doves, increasing
            return {
                doveCount: doveCount,
                speedMultiplier: 1.8 + ((level - 10) * 0.1), // 1.9 to 2.3 - much quicker
                shotsPerRound: Math.ceil(doveCount * 1.5), // 3 shots per 2 birds (1.5x)
                groupSpawnChance: 0.8, // 80% chance of groups
                whiteDoveChance: 0.1, // 10% chance of white dove
                spawnDelay: 1500 - ((level - 10) * 50), // 1.5s to 1.25s intervals
                description: "Erratic Scatters - Spooked flock chaos"
            };
        }
        
        // 🌳 Levels 16–20: Flock & Frenzy
        else if (level <= 20) {
            const doveCount = 3 + Math.floor((level - 15) / 2); // 3-5 doves
            return {
                doveCount: doveCount,
                speedMultiplier: 2.2 + ((level - 15) * 0.15), // 2.35 to 2.95 - very fast
                shotsPerRound: Math.ceil(doveCount * 1.5), // 3 shots per 2 birds (1.5x)
                groupSpawnChance: 0.9, // 90% chance of flocks
                whiteDoveChance: 0.15, // 15% chance of white dove
                spawnDelay: 1200 - ((level - 15) * 30), // 1.2s to 1.05s intervals
                description: "Flock & Frenzy - Sunflower field chaos"
            };
        }
        
        // 🌌 Levels 21+: Expert Dove Mastery
        else {
            const doveCount = Math.min(5 + Math.floor((level - 20) / 2), 8); // 5-8 doves max
            return {
                doveCount: doveCount,
                speedMultiplier: 2.8 + ((level - 20) * 0.1), // 2.9+ - max velocity
                shotsPerRound: Math.ceil(doveCount * 1.5), // 3 shots per 2 birds (1.5x)
                groupSpawnChance: 1.0, // Always large flocks
                whiteDoveChance: 0.2, // 20% chance of white dove
                spawnDelay: Math.max(800, 1000 - ((level - 20) * 20)), // Down to 800ms minimum
                description: "Expert Mastery - Chaotic mixed-speed flocks"
            };
        }
    }

    updateUI() {
        // Update the in-game score display
        if (this.scoreText) {
            this.scoreText.setText(`SCORE: ${this.score}`);
        }
    }

    update() {
        // Update all doves
        this.doves.forEach((dove, index) => {
            if (dove.active) {
                dove.update();
                
                // Remove dove if it's off screen and flying away
                if (dove.x > this.cameras.main.width + 100 || 
                    dove.x < -100 || 
                    dove.y > this.cameras.main.height + 100) {
                    dove.destroy();
                    this.doves.splice(index, 1);
                }
            }
        });
        
        // Continuously check for level completion
        this.checkLevelEnd();
    }
}
