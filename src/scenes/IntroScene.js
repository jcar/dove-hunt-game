import Phaser from 'phaser';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
        this.animationStarted = false;
    }

    create() {
        // Reset the animation flag when scene is created
        this.animationStarted = false;
        
        const { width, height } = this.cameras.main;

        // Simple sky background
        this.add.graphics()
            .fillStyle(0x87CEEB)
            .fillRect(0, 0, width, height);
            
        // Simple ground
        this.add.graphics()
            .fillStyle(0x228B22)
            .fillRect(0, height * 0.8, width, height * 0.2);

        // Game title
        const title = this.add.text(width / 2, height / 3, 'DOVE HUNT', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial Bold'
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(width / 2, height / 3 + 60, '10 Challenging Levels!', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        });
        subtitle.setOrigin(0.5);

        // Click to start
        this.clickToStart = this.add.text(width / 2, height / 2 + 50, 'CLICK TO START', {
            fontSize: '24px',
            fill: '#FF4500',
            fontFamily: 'Arial Bold'
        });
        this.clickToStart.setOrigin(0.5);

        // Pulsing animation for click to start
        this.tweens.add({
            targets: this.clickToStart,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Input handlers (use on instead of once to ensure they work after scene restart)
        this.input.on('pointerdown', () => {
            if (!this.animationStarted) {
                this.startGame();
            }
        });

        // Keyboard input
        this.input.keyboard.on('keydown', () => {
            if (!this.animationStarted) {
                this.startGame();
            }
        });
    }

    createGradientBackground() {
        // Create a gradient background using graphics
        const graphics = this.add.graphics();
        
        // Sky gradient from light blue to deeper blue
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4682B4, 0x4682B4);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height * 0.8);
        
        // Ground
        graphics.fillStyle(0x228B22);
        graphics.fillRect(0, this.cameras.main.height * 0.8, this.cameras.main.width, this.cameras.main.height * 0.2);
    }

    createBackgroundElements() {
        // Add some clouds
        this.createClouds();
        
        // Add trees in background
        for (let i = 0; i < 6; i++) {
            const x = (i * 150) + 50;
            const tree = this.add.graphics();
            
            // Tree trunk
            tree.fillStyle(0x8B4513);
            tree.fillRect(x + 20, this.cameras.main.height * 0.6, 10, 60);
            
            // Tree leaves
            tree.fillStyle(0x228B22);
            tree.fillCircle(x + 25, this.cameras.main.height * 0.6, 25);
            
            // Random tree heights
            tree.setScale(0.8 + Math.random() * 0.4);
        }
    }

    createClouds() {
        for (let i = 0; i < 4; i++) {
            const x = (i * 200) + 100;
            const y = 80 + (Math.random() * 60);
            
            const cloud = this.add.graphics();
            cloud.fillStyle(0xFFFFFF, 0.8);
            
            // Draw cloud shape
            for (let j = 0; j < 5; j++) {
                const offsetX = j * 15;
                const radius = 20 + Math.random() * 10;
                cloud.fillCircle(x + offsetX, y, radius);
            }
            
            // Animate clouds slowly
            this.tweens.add({
                targets: cloud,
                x: cloud.x + 100,
                duration: 20000 + Math.random() * 10000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    createInstructionsPanel() {
        const { width, height } = this.cameras.main;
        
        // Instructions background
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.7);
        panel.fillRoundedRect(width / 2 - 200, height / 2 - 80, 400, 160, 10);
        panel.strokeLineStyle(3, 0xFFD700);
        panel.strokeRoundedRect(width / 2 - 200, height / 2 - 80, 400, 160, 10);

        // Instructions text
        const instructions = [
            '🎯 AIM: Move mouse to aim',
            '🔫 SHOOT: Click to fire',
            '🔄 RELOAD: Press SPACE (3 shots per round)',
            '🔁 RESTART: Press R key'
        ];

        instructions.forEach((instruction, index) => {
            this.add.text(width / 2, (height / 2 - 50) + (index * 25), instruction, {
                fontSize: '16px',
                fill: '#FFFFFF',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });
    }

    createFlyingDove() {
        // Create an animated dove that flies across the screen
        const dove = this.add.graphics();
        
        // Draw dove (darker colors)
        dove.fillStyle(0x808080);
        dove.fillEllipse(0, 0, 30, 18);
        dove.fillStyle(0x909090);
        dove.fillCircle(-12, -6, 8);
        dove.fillStyle(0x505050);
        dove.fillTriangle(-18, -6, -22, -4, -18, -2);
        dove.fillStyle(0x000000);
        dove.fillCircle(-14, -8, 1.5);

        // Start position
        dove.setPosition(-50, 150);
        
        // Flying animation
        this.tweens.add({
            targets: dove,
            x: this.cameras.main.width + 50,
            duration: 8000,
            ease: 'Linear',
            repeat: -1,
            onRepeat: () => {
                dove.y = 100 + Math.random() * 100;
            }
        });

        // Wing flapping
        this.tweens.add({
            targets: dove,
            scaleY: 0.7,
            duration: 200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    startGame() {
        if (this.animationStarted) return;
        this.animationStarted = true;

        // Flash effect
        const flash = this.add.graphics();
        flash.fillStyle(0xFFFFFF, 0.8);
        flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                flash.destroy();
                // Start the game
                this.scene.start('GameScene', { level: 1 });
            }
        });

        // Sound effect (simple beep)
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }
    }

    update() {
        // Any continuous updates can go here
    }
}
