import Phaser from 'phaser';

export default class Dove extends Phaser.GameObjects.Graphics {
    constructor(scene, x, y, speedMultiplier = 1.0, level = 1) {
        // Start off-screen on the left
        const startX = -50;
        const startY = Phaser.Math.Between(100, 400);
        
        super(scene);
        
        // Set position
        this.setPosition(startX, startY);
        
        // Create dove graphics directly - exactly like intro screen
        this.createDoveGraphics();
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set physics properties (updated for proper dove sprite size)
        // Graphics objects need explicit bounds for physics
        this.body.setSize(50, 30); // Match the graphics size
        this.body.setOffset(-25, -15); // Center the physics body
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
        
        // Use the base dove texture without additional tinting to match intro screen exactly
        // The dove texture already has the proper grey coloration
    }
    
    createDoveGraphics() {
        // Draw the exact same dove graphics as used in IntroScene directly on this Graphics object
        
        // Main body (light grey)
        this.fillStyle(0xE0E0E0);
        this.fillEllipse(0, 0, 28, 16);
        
        // Body shading (darker grey)
        this.fillStyle(0xD0D0D0);
        this.fillEllipse(1, 1, 24, 12);
        
        // Head (medium grey) - at the FRONT (right side)
        this.fillStyle(0xE8E8E8);
        this.fillCircle(10, -5, 8);
        
        // Head highlight
        this.fillStyle(0xE0E0E0);
        this.fillCircle(12, -6, 4);
        
        // Beak (dark grey) - pointing forward (right)
        this.fillStyle(0x666666);
        this.beginPath();
        this.moveTo(16, -5);
        this.lineTo(20, -3);
        this.lineTo(16, -1);
        this.closePath();
        this.fillPath();
        
        // Wing with feather details - in the middle
        this.fillStyle(0xC8C8C8);
        this.fillEllipse(-2, -1, 18, 12);
        
        // Wing feather layers
        this.fillStyle(0xB8B8B8);
        this.fillEllipse(-6, 0, 14, 8);
        this.fillEllipse(-9, 1, 10, 6);
        
        // Wing tips
        this.fillStyle(0xA0A0A0);
        this.fillEllipse(-12, 1, 6, 4);
        
        // Tail feathers - at the BACK (left side)
        this.fillStyle(0xD0D0D0);
        this.fillEllipse(-12, 0, 10, 6);
        
        // Eye
        this.fillStyle(0x000000);
        this.fillCircle(12, -6, 1.5);
        
        // Eye highlight
        this.fillStyle(0xFFFFFF);
        this.fillCircle(13, -7, 0.6);
        
        // Neck definition
        this.fillStyle(0xD8D8D8);
        this.fillEllipse(6, -2, 6, 4);
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
        // Hit detection with challenging but fair radius
        const doveCenterX = this.x;
        const doveCenterY = this.y;
        
        // Balanced hit radius - challenging but not frustrating
        const hitRadius = 32; // Requires precision but still achievable
        
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
        
        // Change sprite appearance (darker/different color) - Graphics objects don't support setTint
        // Instead, we'll change the alpha or recreate with darker colors
        this.setAlpha(0.7);
        
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
        // Create simple circle particles for hit effect
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.graphics();
            particle.fillStyle(Phaser.Utils.Array.GetRandom([0xff0000, 0xffff00, 0xff8800]));
            particle.fillCircle(0, 0, 2);
            particle.setPosition(this.x, this.y);
            
            // Random direction and speed
            const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
            const speed = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Animate particle
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + vx,
                y: particle.y + vy,
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
        
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
