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
            `Speed: ${levelConfig.speedMultiplier}x`,
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
        // Define level configurations
        const configs = {
            1: { doveCount: 1, speedMultiplier: 1.0, shotsPerRound: 3 },
            2: { doveCount: 2, speedMultiplier: 1.1, shotsPerRound: 3 },
            3: { doveCount: 2, speedMultiplier: 1.2, shotsPerRound: 3 },
            4: { doveCount: 3, speedMultiplier: 1.3, shotsPerRound: 3 },
            5: { doveCount: 3, speedMultiplier: 1.4, shotsPerRound: 3 },
            6: { doveCount: 4, speedMultiplier: 1.5, shotsPerRound: 3 },
            7: { doveCount: 4, speedMultiplier: 1.6, shotsPerRound: 3 },
            8: { doveCount: 5, speedMultiplier: 1.7, shotsPerRound: 3 },
            9: { doveCount: 5, speedMultiplier: 1.8, shotsPerRound: 3 },
            10: { doveCount: 6, speedMultiplier: 2.0, shotsPerRound: 3 }
        };

        return configs[level] || configs[10];
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
