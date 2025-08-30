import Phaser from 'phaser';
import Dove from '../sprites/Dove.js';

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
        const levelX = this.isMobile ? width / 2 : 20;
        const levelY = this.isMobile ? 15 : 20;
        
        this.levelText = this.add.text(levelX, levelY, `LEVEL ${this.level}`, {
            fontSize: levelFontSize,
            fill: '#FFD700',
            fontFamily: 'Arial Bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        if (this.isMobile) {
            this.levelText.setOrigin(0.5, 0);
        }
        
        this.levelText.setDepth(1000);
        
        // Set up input
        this.setupInput();
        
        // Create dove group
        this.doveGroup = this.physics.add.group();
        
        // Initialize level
        this.dovesSpawned = 0;
        this.levelStartTime = this.time.now;
        
        // Start level
        this.startLevel();
        
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
        const spawnInterval = Math.max(1000, 3000 - (this.level * 200)); // Faster spawning at higher levels
        
        // Spawn doves over time
        this.doveSpawnTimer = this.time.addEvent({
            delay: spawnInterval,
            callback: () => {
                if (this.dovesSpawned < this.dovesRequired) {
                    this.spawnDove();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Spawn first dove immediately
        this.spawnDove();
    }

    spawnDove() {
        if (this.dovesSpawned >= this.dovesRequired) {
            return;
        }
        
        const dove = new Dove(this, 0, 0, this.levelConfig.speedMultiplier, this.level);
        this.doves.push(dove);
        this.doveGroup.add(dove);
        this.dovesSpawned++;
        
        this.updateUI();
    }

    shoot(pointer) {
        if (this.shotsLeft <= 0) {
            return;
        }

        this.shotsLeft--;
        this.gameStats.totalShots++;
        this.updateUI();

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
                const baseScore = this.calculateHitScore();
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
        this.shotsLeft = 3;
        this.updateUI();
    }

    checkLevelEnd() {
        // Check if all doves have been spawned and none are active
        const activeDoves = this.doves.filter(dove => dove.active);
        const allDovesSpawned = this.dovesSpawned >= this.dovesRequired;
        
        // Don't end level immediately - let dove fall animation play
        if (allDovesSpawned && activeDoves.length === 0) {
            // Only complete level if we haven't already started the completion process
            if (!this.levelCompleting) {
                this.levelCompleting = true;
                
                // Wait 3 seconds to let dove fall animations play and player celebrate
                this.time.delayedCall(3000, () => {
                    this.completeLevel();
                });
            }
        } else if (this.shotsLeft <= 0 && activeDoves.length > 0) {
            // Game over - ran out of shots with doves still active
            if (!this.levelCompleting) {
                this.levelCompleting = true;
                // Also add a small delay for game over to let final shot animation play
                this.time.delayedCall(1500, () => {
                    this.gameOver();
                });
            }
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
            if (this.level >= 10) {
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
    
    calculateHitScore() {
        // Base score increases with level difficulty
        const baseScore = 100 + (this.level * 50); // 150 pts level 1, up to 600 pts level 10
        
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
            bonus += 500 + (this.level * 100); // 600 pts level 1, up to 1500 pts level 10
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
        // All levels have exactly 2 doves, difficulty comes from speed
        const configs = {
            1: { doveCount: 2, speedMultiplier: 1.0, shotsPerRound: 3 },
            2: { doveCount: 2, speedMultiplier: 1.1, shotsPerRound: 3 },
            3: { doveCount: 2, speedMultiplier: 1.2, shotsPerRound: 3 },
            4: { doveCount: 2, speedMultiplier: 1.3, shotsPerRound: 3 },
            5: { doveCount: 2, speedMultiplier: 1.4, shotsPerRound: 3 },
            6: { doveCount: 2, speedMultiplier: 1.5, shotsPerRound: 3 },
            7: { doveCount: 2, speedMultiplier: 1.6, shotsPerRound: 3 },
            8: { doveCount: 2, speedMultiplier: 1.7, shotsPerRound: 3 },
            9: { doveCount: 2, speedMultiplier: 1.8, shotsPerRound: 3 },
            10: { doveCount: 2, speedMultiplier: 2.0, shotsPerRound: 3 }
        };

        return configs[level] || { doveCount: 2, speedMultiplier: 2.0, shotsPerRound: 3 };
    }

    updateUI() {
        // Update HTML elements
        const scoreEl = document.getElementById('score');
        const dovesHitEl = document.getElementById('doves-hit');
        const shotsLeftEl = document.getElementById('shots-left');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (dovesHitEl) dovesHitEl.textContent = `${this.dovesHit}/${this.dovesRequired}`;
        if (shotsLeftEl) shotsLeftEl.textContent = this.shotsLeft;
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
