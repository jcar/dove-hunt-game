import Phaser from 'phaser';

export default class Dove extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, speedMultiplier = 1.0, level = 1) {
        // Start off-screen on the left
        const startX = -50;
        const startY = Phaser.Math.Between(100, 400);
        
        super(scene, startX, startY, 'dove');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set physics properties (updated for new sprite size)
        this.body.setSize(45, 28);
        this.body.setCollideWorldBounds(false);
        
        // Dove state
        this.active = true;
        this.isHit = false;
        this.level = level;
        this.flightPattern = this.selectFlightPattern(level); // Level-based flight pattern selection
        
        // Movement properties
        this.baseSpeed = Phaser.Math.Between(80, 150);
        this.speed = this.baseSpeed * speedMultiplier;
        this.speedMultiplier = speedMultiplier;
        this.waveAmplitude = Phaser.Math.Between(30, 70); // Randomized wave size
        this.waveFrequency = (0.01 + Math.random() * 0.03) * speedMultiplier; // More random wave frequency
        this.initialY = this.y;
        this.timeAlive = 0;
        
        // Enhanced movement properties
        this.directionChangeTimer = 0;
        this.directionChangeCooldown = Phaser.Math.Between(60, 180); // Change direction every 1-3 seconds
        this.zigzagDirection = 1;
        this.erraticTimer = 0;
        
        // Set initial velocity based on flight pattern
        this.setupFlightPattern();
        
        // Track if we need to force velocity
        this.needsVelocityFix = true;
        
        // Animation properties
        this.flapTimer = 0;
        this.originalScale = 1;
        
        // Set random tint for variety - subtle variations that work well with white dove
        const tints = [
            0xffffff, // Pure white (classic dove)
            0xf8f8ff, // Ghost white (slightly blue)
            0xf5f5f5, // White smoke (slightly gray)
            0xfaf0e6, // Linen (slightly cream)
            0xfff8dc  // Cornsilk (slightly yellow)
        ];
        this.setTint(Phaser.Utils.Array.GetRandom(tints));
    }
    
    selectFlightPattern(level) {
        // Progressive difficulty - each level introduces more challenging patterns
        // and reduces the chance of easier patterns
        
        const patterns = [];
        
        // Level 1-2: Mostly straight flight (easy)
        if (level <= 2) {
            patterns.push(0, 0, 0, 0, 0); // 5x straight
            patterns.push(1, 1); // 2x wave
            patterns.push(2); // 1x diagonal
        }
        // Level 3-4: Mix of easy and medium patterns
        else if (level <= 4) {
            patterns.push(0, 0, 0); // 3x straight
            patterns.push(1, 1, 1); // 3x wave
            patterns.push(2, 2); // 2x diagonal
            patterns.push(3); // 1x zigzag
        }
        // Level 5-6: More medium patterns, introduce erratic
        else if (level <= 6) {
            patterns.push(0, 0); // 2x straight
            patterns.push(1, 1, 1); // 3x wave
            patterns.push(2, 2, 2); // 3x diagonal
            patterns.push(3, 3); // 2x zigzag
            patterns.push(4); // 1x erratic
        }
        // Level 7-8: Mostly hard patterns
        else if (level <= 8) {
            patterns.push(0); // 1x straight
            patterns.push(1, 1); // 2x wave
            patterns.push(2, 2); // 2x diagonal
            patterns.push(3, 3, 3); // 3x zigzag
            patterns.push(4, 4); // 2x erratic
        }
        // Level 9-10: Hardest patterns dominate
        else {
            patterns.push(1); // 1x wave (minimum predictability)
            patterns.push(2); // 1x diagonal
            patterns.push(3, 3); // 2x zigzag
            patterns.push(4, 4, 4, 4); // 4x erratic (most chaotic)
        }
        
        // Select random pattern from weighted array
        return Phaser.Utils.Array.GetRandom(patterns);
    }
    
    setupFlightPattern() {
        switch(this.flightPattern) {
            case 0: // Straight flight
                this.body.setVelocity(this.speed, 0);
                break;
            case 1: // Wave pattern
                this.body.setVelocity(this.speed, 0);
                break;
            case 2: // Diagonal flight
                const verticalSpeed = Phaser.Math.Between(-50, 50);
                this.body.setVelocity(this.speed, verticalSpeed);
                break;
        }
    }
    
    update() {
        if (!this.active) return;
        
        // Force velocity if it's been reset to 0 (common Phaser issue)
        if (this.needsVelocityFix || Math.abs(this.body.velocity.x) < 10) {
            this.body.setVelocity(this.speed, this.body.velocity.y);
            this.needsVelocityFix = false;
        }
        
        this.timeAlive += 1/60; // Assuming 60fps
        this.directionChangeTimer++;
        this.erraticTimer++;
        
        // Handle different flight patterns with enhanced movement
        this.updateMovementPattern();
        
        // More frequent direction changes based on timer
        if (this.directionChangeTimer >= this.directionChangeCooldown) {
            this.changeDirection();
            this.directionChangeTimer = 0;
            this.directionChangeCooldown = Phaser.Math.Between(30, 120); // 0.5-2 seconds
        }
        
        // Random sudden direction changes (more frequent)
        if (Phaser.Math.Between(0, 100) < 3) { // 3% chance each frame
            this.suddenDirectionChange();
        }
        
        // Wing flapping animation
        this.flapTimer += 1/60;
        if (this.flapTimer > 0.2) {
            this.scaleY = this.scaleY === 1 ? 0.8 : 1;
            this.flapTimer = 0;
        }
        
        // Boundary checks - bounce off top and bottom with more dynamic response
        if (this.y < 50) {
            this.body.setVelocityY(Math.abs(this.body.velocity.y) + Phaser.Math.Between(10, 30));
            this.zigzagDirection *= -1; // Change zigzag direction when hitting boundaries
        } else if (this.y > 450) {
            this.body.setVelocityY(-Math.abs(this.body.velocity.y) - Phaser.Math.Between(10, 30));
            this.zigzagDirection *= -1;
        }
    }
    
    updateMovementPattern() {
        switch(this.flightPattern) {
            case 0: // Straight flight (but with occasional wobble)
                if (Phaser.Math.Between(0, 200) < 1) {
                    this.body.setVelocityY(this.body.velocity.y + Phaser.Math.Between(-20, 20));
                }
                break;
                
            case 1: // Wave pattern
                const waveY = this.initialY + Math.sin(this.timeAlive * this.waveFrequency * this.speed) * this.waveAmplitude;
                this.y = waveY;
                break;
                
            case 2: // Diagonal flight with direction changes
                // Keep the diagonal movement but add some variation
                if (Phaser.Math.Between(0, 150) < 1) {
                    this.body.setVelocityY(this.body.velocity.y * -0.8); // Reverse direction occasionally
                }
                break;
                
            case 3: // Zigzag pattern
                if (this.erraticTimer % 40 === 0) { // Change every ~0.67 seconds
                    this.zigzagDirection *= -1;
                    this.body.setVelocityY(this.zigzagDirection * Phaser.Math.Between(40, 80));
                }
                break;
                
            case 4: // Erratic/chaotic movement
                if (this.erraticTimer % 20 === 0) { // Change every ~0.33 seconds
                    const newVelY = Phaser.Math.Between(-100, 100);
                    this.body.setVelocityY(newVelY);
                    // Occasionally change horizontal speed too
                    if (Phaser.Math.Between(0, 100) < 20) {
                        const speedVariation = this.speed * Phaser.Math.FloatBetween(0.8, 1.3);
                        this.body.setVelocityX(speedVariation);
                    }
                }
                break;
        }
    }
    
    changeDirection() {
        // Slight vertical direction change
        const currentVelY = this.body.velocity.y;
        const newVelY = currentVelY + Phaser.Math.Between(-40, 40);
        this.body.setVelocityY(Phaser.Math.Clamp(newVelY, -120, 120));
    }
    
    suddenDirectionChange() {
        // More dramatic direction change
        const newVelY = Phaser.Math.Between(-80, 80);
        this.body.setVelocityY(newVelY);
        
        // Occasionally change horizontal speed too for more chaos
        if (Phaser.Math.Between(0, 100) < 30) {
            const speedVariation = this.speed * Phaser.Math.FloatBetween(0.7, 1.4);
            this.body.setVelocityX(speedVariation);
        }
    }
    
    checkHit(x, y) {
        // Hit detection with reduced radius for increased difficulty
        const doveCenterX = this.x;
        const doveCenterY = this.y;
        
        // Reduced hit radius by 33% from 48 to 32 pixels for more challenging gameplay
        const hitRadius = 32; // Further reduced for precision aiming
        
        // Calculate distance from click to dove center
        const distance = Math.sqrt(
            Math.pow(x - doveCenterX, 2) + Math.pow(y - doveCenterY, 2)
        );
        
        return distance <= hitRadius;
    }
    
    hit() {
        if (this.isHit) return;
        
        this.isHit = true;
        this.active = false;
        
        // Change sprite appearance (darker/different color)
        this.setTint(0x888888);
        
        // Stop horizontal movement, add falling physics
        this.body.setVelocity(Phaser.Math.Between(-50, 50), 0);
        this.body.setGravityY(300);
        
        // Add rotation as it falls
        this.scene.tweens.add({
            targets: this,
            angle: 180,
            duration: 1000,
            ease: 'Power2'
        });
        
        // Scale down slightly
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 500,
            ease: 'Power2'
        });
        
        // Create hit effect
        this.createHitEffect();
        
        // Remove dove after falling
        this.scene.time.delayedCall(2000, () => {
            if (this.active !== undefined) { // Check if not already destroyed
                this.destroy();
            }
        });
    }
    
    createHitEffect() {
        // Create particle effect for hit
        const particles = this.scene.add.particles(this.x, this.y, 'dove', {
            scale: { start: 0.3, end: 0 },
            speed: { min: 50, max: 150 },
            lifespan: 500,
            quantity: 8,
            tint: [0xff0000, 0xffff00, 0xff8800]
        });
        
        // Clean up particles
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
        
        // Screen shake effect
        this.scene.cameras.main.shake(100, 0.02);
    }
    
    flyAway() {
        // If dove wasn't shot, it flies away faster
        this.body.setVelocity(this.speed * 1.5, -100);
        this.active = false;
        
        // Fade out as it flies away
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
        });
    }
    
    destroy() {
        if (this.scene && this.scene.sys && !this.scene.sys.isDestroyed) {
            super.destroy();
        }
    }
}
