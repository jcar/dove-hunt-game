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
        // Create a more iconic dove sprite using graphics
        const graphics = this.add.graphics();
        
        // Main body (light pearl gray)
        graphics.fillStyle(0xF5F5F5);
        graphics.fillEllipse(0, 0, 32, 20);
        
        // Body shading (slightly darker)
        graphics.fillStyle(0xE8E8E8);
        graphics.fillEllipse(2, 2, 28, 16);
        
        // Head (pure white)
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(-12, -6, 10);
        
        // Head highlight
        graphics.fillStyle(0xF8F8F8);
        graphics.fillCircle(-10, -8, 6);
        
        // Beak (orange-yellow)
        graphics.fillStyle(0xFFA500);
        graphics.beginPath();
        graphics.moveTo(-20, -6);
        graphics.lineTo(-24, -4);
        graphics.lineTo(-20, -2);
        graphics.closePath();
        graphics.fillPath();
        
        // Wing (detailed feathering)
        graphics.fillStyle(0xDDDDDD);
        graphics.fillEllipse(3, -2, 22, 14);
        
        // Wing feather details
        graphics.fillStyle(0xCCCCCC);
        graphics.fillEllipse(8, -1, 16, 10);
        graphics.fillEllipse(12, 1, 12, 8);
        
        // Wing tips (darker)
        graphics.fillStyle(0xAAAAAA);
        graphics.fillEllipse(15, 2, 8, 6);
        
        // Tail feathers
        graphics.fillStyle(0xE0E0E0);
        graphics.fillEllipse(14, 0, 12, 8);
        
        // Tail feather separation
        graphics.fillStyle(0xD0D0D0);
        graphics.fillRect(16, -2, 1, 4);
        graphics.fillRect(19, -1, 1, 2);
        
        // Eye (black with small highlight)
        graphics.fillStyle(0x000000);
        graphics.fillCircle(-15, -8, 2);
        
        // Eye highlight
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(-14, -9, 0.8);
        
        // Neck definition
        graphics.fillStyle(0xF0F0F0);
        graphics.fillEllipse(-8, -3, 8, 6);

        // Generate texture from graphics
        graphics.generateTexture('dove', 55, 35);
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
