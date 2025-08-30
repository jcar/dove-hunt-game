import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create simple colored rectangles as placeholder sprites
        this.createDoveSprite();
        this.createGrassTexture();
        this.createTreeTexture();
    }

    createDoveSprite() {
        // Create a simple dove sprite using graphics
        const graphics = this.add.graphics();
        
        // Dove body (darker gray)
        graphics.fillStyle(0x808080);
        graphics.fillEllipse(0, 0, 40, 25);
        
        // Dove head (medium gray)
        graphics.fillStyle(0x909090);
        graphics.fillCircle(-15, -8, 12);
        
        // Dove beak (dark gray)
        graphics.fillStyle(0x505050);
        graphics.fillTriangle(-25, -8, -30, -5, -25, -2);
        
        // Dove wing (darker silver)
        graphics.fillStyle(0x707070);
        graphics.fillEllipse(5, 0, 25, 15);
        
        // Eye (black dot)
        graphics.fillStyle(0x000000);
        graphics.fillCircle(-18, -10, 2);

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
        // Start the intro scene
        this.scene.start('IntroScene');
    }
}
