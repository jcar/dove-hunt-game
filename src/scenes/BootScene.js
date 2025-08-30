import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show loading text
        const { width, height } = this.cameras.main;
        this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.loadingText.setOrigin(0.5);
        
        // Create simple colored rectangles as placeholder sprites
        this.createDoveSprite();
        this.createGrassTexture();
        this.createTreeTexture();
        
        // Simple loading simulation
        let progress = 0;
        const progressTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                progress += 10;
                this.loadingText.setText(`Loading... ${progress}%`);
                
                if (progress >= 100) {
                    progressTimer.destroy();
                    this.loadingText.setText('Ready!');
                    this.time.delayedCall(500, () => {
                        this.scene.start('IntroScene');
                    });
                }
            },
            loop: true
        });
    }

    createDoveSprite() {
        // Use the same dove design as intro screen - more grey
        const graphics = this.add.graphics();
        
        // Main body (light grey)
        graphics.fillStyle(0xE0E0E0);
        graphics.fillEllipse(0, 0, 28, 16);
        
        // Body shading (darker grey)
        graphics.fillStyle(0xD0D0D0);
        graphics.fillEllipse(1, 1, 24, 12);
        
        // Head (medium grey) - at the FRONT (right side for left-to-right flight)
        graphics.fillStyle(0xE8E8E8);
        graphics.fillCircle(10, -5, 8);
        
        // Head highlight
        graphics.fillStyle(0xE0E0E0);
        graphics.fillCircle(12, -6, 4);
        
        // Beak (dark grey) - pointing forward (right)
        graphics.fillStyle(0x666666);
        graphics.beginPath();
        graphics.moveTo(16, -5);
        graphics.lineTo(20, -3);
        graphics.lineTo(16, -1);
        graphics.closePath();
        graphics.fillPath();
        
        // Wing with feather details - in the middle
        graphics.fillStyle(0xC8C8C8);
        graphics.fillEllipse(-2, -1, 18, 12);
        
        // Wing feather layers
        graphics.fillStyle(0xB8B8B8);
        graphics.fillEllipse(-6, 0, 14, 8);
        graphics.fillEllipse(-9, 1, 10, 6);
        
        // Wing tips
        graphics.fillStyle(0xA0A0A0);
        graphics.fillEllipse(-12, 1, 6, 4);
        
        // Tail feathers - at the BACK (left side)
        graphics.fillStyle(0xD0D0D0);
        graphics.fillEllipse(-12, 0, 10, 6);
        
        // Eye
        graphics.fillStyle(0x000000);
        graphics.fillCircle(12, -6, 1.5);
        
        // Eye highlight
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(13, -7, 0.6);
        
        // Neck definition
        graphics.fillStyle(0xD8D8D8);
        graphics.fillEllipse(6, -2, 6, 4);

        // Generate texture from graphics
        graphics.generateTexture('dove', 50, 30);
        graphics.destroy();
    }

    createGrassTexture() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x228B22); // Forest green
        graphics.fillRect(0, 0, 800, 100);
        
        // Add some texture with darker green
        graphics.fillStyle(0x006400);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 100;
            graphics.fillRect(x, y, 2, 8);
        }
        
        graphics.generateTexture('grass', 800, 100);
        graphics.destroy();
    }

    createTreeTexture() {
        const graphics = this.add.graphics();
        
        // Tree trunk (brown)
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(20, 40, 10, 40);
        
        // Tree leaves (green)
        graphics.fillStyle(0x228B22);
        graphics.fillCircle(25, 30, 25);
        
        graphics.generateTexture('tree', 50, 80);
        graphics.destroy();
    }

    create() {
        // Scene will be started after loading is complete
        // See the 'complete' event handler in preload()
    }
}
