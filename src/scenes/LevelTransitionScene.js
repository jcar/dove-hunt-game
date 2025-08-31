import Phaser from 'phaser';

export default class LevelTransitionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelTransitionScene' });
    }

    init(data) {
        this.level = data.level || 1;
        this.score = data.score || 0;
        this.dovesHit = data.dovesHit || 0;
        this.gameStats = data.gameStats || {};
        this.isGameComplete = data.isGameComplete || false;
        this.isGameOver = data.isGameOver || false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.graphics()
            .fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066)
            .fillRect(0, 0, width, height);

        if (this.isGameComplete) {
            this.showGameComplete();
        } else if (this.isGameOver) {
            this.showGameOver();
        } else {
            this.showLevelTransition();
        }

        // Continue instruction
        const continueText = this.add.text(width / 2, height - 60, 
            this.isGameComplete || this.isGameOver ? 'CLICK TO RETURN TO MENU' : 'CLICK TO CONTINUE', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial Bold'
        });
        continueText.setOrigin(0.5);

        // Pulsing animation
        this.tweens.add({
            targets: continueText,
            alpha: 0.5,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Input handler
        this.input.once('pointerdown', () => {
            this.handleContinue();
        });

        this.input.keyboard.once('keydown', () => {
            this.handleContinue();
        });
    }

    showLevelTransition() {
        const { width, height } = this.cameras.main;

        // Level complete title
        const title = this.add.text(width / 2, 100, `LEVEL ${this.level - 1} COMPLETE!`, {
            fontSize: '48px',
            fill: '#00FF00',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // Stats
        const stats = [
            `Score: ${this.score}`,
            `Doves Hit: ${this.dovesHit}`,
            ``,
            `Preparing Level ${this.level}...`
        ];

        stats.forEach((stat, index) => {
            const text = this.add.text(width / 2, 200 + (index * 40), stat, {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Arial'
            });
            text.setOrigin(0.5);
        });

        // Level preview
        this.showLevelPreview();

        // Entrance animation
        title.setScale(0);
        this.tweens.add({
            targets: title,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Bounce.easeOut'
        });
    }

    showLevelPreview() {
        const { width, height } = this.cameras.main;
        const levelConfig = this.getLevelConfig(this.level);

        // Preview panel
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRoundedRect(width / 2 - 200, 380, 400, 120, 10);
        panel.lineStyle(3, 0xFFD700);
        panel.strokeRoundedRect(width / 2 - 200, 380, 400, 120, 10);

        // Level info
        const levelTitle = this.add.text(width / 2, 400, `LEVEL ${this.level}`, {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'Arial Bold'
        });
        levelTitle.setOrigin(0.5);

        const preview = [
            `Doves: ${levelConfig.doveCount}`,
            `Speed: ${levelConfig.speedMultiplier.toFixed(1)}x`,
            `Shots: ${levelConfig.shotsPerRound}`
        ];

        preview.forEach((info, index) => {
            this.add.text(width / 2, 430 + (index * 20), info, {
                fontSize: '16px',
                fill: '#FFFFFF',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });
    }

    showGameComplete() {
        const { width, height } = this.cameras.main;

        // Title
        const title = this.add.text(width / 2, 50, 'GAME COMPLETE!', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // Main score display
        const finalScore = this.add.text(width / 2, 110, `FINAL SCORE: ${this.score}`, {
            fontSize: '32px',
            fill: '#00FF00',
            fontFamily: 'Arial Bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        finalScore.setOrigin(0.5);

        // Score breakdown panel
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRoundedRect(50, 160, width - 100, 320, 10);
        panel.lineStyle(3, 0xFFD700);
        panel.strokeRoundedRect(50, 160, width - 100, 320, 10);

        // Breakdown title
        const breakdownTitle = this.add.text(width / 2, 180, 'SCORE BREAKDOWN', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Arial Bold'
        });
        breakdownTitle.setOrigin(0.5);

        // Calculate accuracy percentage
        const accuracy = this.gameStats.totalShots > 0 ? 
            Math.round((this.gameStats.totalDoves / this.gameStats.totalShots) * 100) : 0;

        // Calculate shot efficiency stats
        const totalPossibleShots = 10 * 3; // 10 levels × 3 shots per level = 30 max shots
        const shotsUsed = this.gameStats.totalShots || 0;
        const shotsSaved = totalPossibleShots - shotsUsed;
        
        // Detailed statistics
        const leftColumn = [
            '📊 SHOOTING STATISTICS:',
            `Total Shots Fired: ${shotsUsed}`,
            `Total Shots Available: ${totalPossibleShots}`,
            `Shots Saved: ${shotsSaved}`,
            `Total Doves Hit: ${this.gameStats.totalDoves || 0}`,
            `Overall Accuracy: ${accuracy}%`,
            '',
            '🎯 ACCURACY BREAKDOWN:',
            `First Shot Hits: ${this.gameStats.firstShotHits || 0} (2x points)`,
            `Second Shot Hits: ${this.gameStats.secondShotHits || 0} (1.5x points)`,
            `Third Shot Hits: ${this.gameStats.thirdShotHits || 0} (1x points)`
        ];

        const rightColumn = [
            '🏆 PERFORMANCE BONUSES:',
            `Perfect Levels: ${this.gameStats.perfectLevels || 0}`,
            `Bonus Points Earned: ${this.gameStats.bonusPoints || 0}`,
            '',
            '⚡ EFFICIENCY RATING:',
            this.getEfficiencyRating(accuracy),
            '',
            '🎖️ FINAL RANK:',
            this.getFinalRank(this.score, accuracy)
        ];

        // Display left column
        leftColumn.forEach((stat, index) => {
            const isHeader = stat.includes('📊') || stat.includes('🎯');
            const text = this.add.text(70, 210 + (index * 22), stat, {
                fontSize: isHeader ? '16px' : '14px',
                fill: isHeader ? '#FFD700' : '#FFFFFF',
                fontFamily: isHeader ? 'Arial Bold' : 'Arial'
            });
        });

        // Display right column
        rightColumn.forEach((stat, index) => {
            const isHeader = stat.includes('🏆') || stat.includes('⚡') || stat.includes('🎖️');
            const text = this.add.text(width / 2 + 20, 210 + (index * 22), stat, {
                fontSize: isHeader ? '16px' : '14px',
                fill: isHeader ? '#FFD700' : '#FFFFFF',
                fontFamily: isHeader ? 'Arial Bold' : 'Arial'
            });
        });

        // Congratulations message
        const congrats = this.add.text(width / 2, 500, '🎉 You are a Master Dove Hunter! 🎉', {
            fontSize: '20px',
            fill: '#00FF00',
            fontFamily: 'Arial Bold'
        });
        congrats.setOrigin(0.5);

        // Entrance animations
        title.setScale(0);
        this.tweens.add({
            targets: title,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Bounce.easeOut'
        });

        panel.setAlpha(0);
        this.tweens.add({
            targets: panel,
            alpha: 1,
            duration: 1000,
            delay: 500
        });
    }

    showGameOver() {
        const { width, height } = this.cameras.main;

        // Title
        const title = this.add.text(width / 2, 50, 'GAME OVER', {
            fontSize: '48px',
            fill: '#FF0000',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // Main score display
        const finalScore = this.add.text(width / 2, 110, `FINAL SCORE: ${this.score}`, {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial Bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        finalScore.setOrigin(0.5);

        // Level reached
        const levelReached = this.add.text(width / 2, 140, `Level Reached: ${this.level}`, {
            fontSize: '20px',
            fill: '#FFAA00',
            fontFamily: 'Arial'
        });
        levelReached.setOrigin(0.5);

        // Score breakdown panel (same as game complete but with different title)
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.8);
        panel.fillRoundedRect(50, 180, width - 100, 280, 10);
        panel.lineStyle(3, 0xFF4444);
        panel.strokeRoundedRect(50, 180, width - 100, 280, 10);

        // Breakdown title
        const breakdownTitle = this.add.text(width / 2, 200, 'FINAL STATISTICS', {
            fontSize: '24px',
            fill: '#FF4444',
            fontFamily: 'Arial Bold'
        });
        breakdownTitle.setOrigin(0.5);

        // Calculate accuracy percentage
        const accuracy = this.gameStats.totalShots > 0 ? 
            Math.round((this.gameStats.totalDoves / this.gameStats.totalShots) * 100) : 0;

        // Calculate shot efficiency stats for the levels played
        const levelsPlayed = this.level;
        const totalPossibleShots = levelsPlayed * 3; // levels played × 3 shots per level
        const shotsUsed = this.gameStats.totalShots || 0;
        const shotsSaved = totalPossibleShots - shotsUsed;
        
        // Detailed statistics (adjusted for game over)
        const leftColumn = [
            '📊 SHOOTING STATISTICS:',
            `Total Shots Fired: ${shotsUsed}`,
            `Total Shots Available: ${totalPossibleShots}`,
            `Shots Saved: ${shotsSaved}`,
            `Total Doves Hit: ${this.gameStats.totalDoves || 0}`,
            `Overall Accuracy: ${accuracy}%`,
            '',
            '🎯 ACCURACY BREAKDOWN:',
            `First Shot Hits: ${this.gameStats.firstShotHits || 0} (2x points)`,
            `Second Shot Hits: ${this.gameStats.secondShotHits || 0} (1.5x points)`,
            `Third Shot Hits: ${this.gameStats.thirdShotHits || 0} (1x points)`
        ];

        const rightColumn = [
            '🏆 PERFORMANCE BONUSES:',
            `Perfect Levels: ${this.gameStats.perfectLevels || 0}`,
            `Bonus Points Earned: ${this.gameStats.bonusPoints || 0}`,
            '',
            '⚡ EFFICIENCY RATING:',
            this.getEfficiencyRating(accuracy),
            '',
            '🎖️ FINAL RANK:',
            this.getFinalRank(this.score, accuracy)
        ];

        // Display left column
        leftColumn.forEach((stat, index) => {
            const isHeader = stat.includes('📊') || stat.includes('🎯');
            const text = this.add.text(70, 230 + (index * 20), stat, {
                fontSize: isHeader ? '16px' : '14px',
                fill: isHeader ? '#FF4444' : '#FFFFFF',
                fontFamily: isHeader ? 'Arial Bold' : 'Arial'
            });
        });

        // Display right column
        rightColumn.forEach((stat, index) => {
            const isHeader = stat.includes('🏆') || stat.includes('⚡') || stat.includes('🎖️');
            const text = this.add.text(width / 2 + 20, 230 + (index * 20), stat, {
                fontSize: isHeader ? '16px' : '14px',
                fill: isHeader ? '#FF4444' : '#FFFFFF',
                fontFamily: isHeader ? 'Arial Bold' : 'Arial'
            });
        });

        // Game over message
        const gameOverMsg = this.add.text(width / 2, 480, 'Better luck next time!', {
            fontSize: '18px',
            fill: '#FFAA00',
            fontFamily: 'Arial Bold'
        });
        gameOverMsg.setOrigin(0.5);

        // Shake animation
        this.cameras.main.shake(500, 0.02);
        
        // Panel animation
        panel.setAlpha(0);
        this.tweens.add({
            targets: panel,
            alpha: 1,
            duration: 1000,
            delay: 500
        });
    }

    getEfficiencyRating(accuracy) {
        if (accuracy >= 90) return 'LEGENDARY MARKSMAN ⭐⭐⭐';
        if (accuracy >= 80) return 'EXPERT HUNTER ⭐⭐';
        if (accuracy >= 70) return 'SKILLED SHOOTER ⭐';
        if (accuracy >= 60) return 'DECENT AIM';
        if (accuracy >= 50) return 'NEEDS PRACTICE';
        return 'ROOKIE HUNTER';
    }
    
    getFinalRank(score, accuracy) {
        if (score >= 50000 && accuracy >= 85) return 'DOVE HUNTING LEGEND';
        if (score >= 40000 && accuracy >= 80) return 'MASTER HUNTER';
        if (score >= 30000 && accuracy >= 75) return 'EXPERT MARKSMAN';
        if (score >= 20000 && accuracy >= 70) return 'SKILLED HUNTER';
        if (score >= 10000 && accuracy >= 60) return 'CAPABLE SHOOTER';
        if (score >= 5000) return 'NOVICE HUNTER';
        return 'TRAINING NEEDED';
    }

    getLevelConfig(level) {
        // Use the same level configuration as GameScene to ensure consistency
        
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

    handleContinue() {
        if (this.isGameComplete || this.isGameOver) {
            // Return to intro
            this.scene.start('IntroScene');
        } else {
            // Continue to next level - pass all necessary data including gameStats
            this.scene.start('GameScene', { 
                level: this.level,
                score: this.score,
                dovesHit: this.dovesHit,
                gameStats: this.gameStats
            });
        }
    }
}
