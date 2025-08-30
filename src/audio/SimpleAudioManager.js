class SimpleAudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.6;
        this.isMusicEnabled = true;
        this.isSfxEnabled = true;
        this.isAudioEnabled = false;
        this.initialized = false;
        
        // Load settings
        this.loadSettings();
    }
    
    // Create simple beep sounds using Web Audio API directly
    createBeepSound(frequency, duration, waveType = 'sine') {
        if (!window.AudioContext && !window.webkitAudioContext) {
            return null;
        }
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        return () => {
            if (!this.isSfxEnabled || audioContext.state === 'suspended') return;
            
            try {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = waveType;
                
                gainNode.gain.setValueAtTime(this.sfxVolume * 0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Error playing beep sound:', error);
            }
        };
    }
    
    // Enable audio on first user interaction
    enableAudio() {
        if (this.isAudioEnabled) return;
        
        this.isAudioEnabled = true;
        
        // Create simple sound effects
        this.sounds = {
            shot: this.createBeepSound(1000, 0.1, 'square'),
            hit: this.createBeepSound(800, 0.2, 'triangle'),
            explosion: this.createBeepSound(150, 0.5, 'sawtooth'),
            whoosh: this.createBeepSound(400, 0.4, 'sine'),
            levelComplete: this.createBeepSound(440, 0.8, 'sine')
        };
        
        console.log('Audio enabled!');
    }
    
    init() {
        // Only initialize once
        if (this.initialized) return;
        this.initialized = true;
        
        // Audio will be enabled on first user interaction
        // Set up a one-time click listener to enable audio
        const enableAudioOnce = () => {
            this.enableAudio();
            document.removeEventListener('click', enableAudioOnce);
            document.removeEventListener('keydown', enableAudioOnce);
            document.removeEventListener('touchstart', enableAudioOnce);
        };
        
        document.addEventListener('click', enableAudioOnce);
        document.addEventListener('keydown', enableAudioOnce);
        document.addEventListener('touchstart', enableAudioOnce);
    }
    
    playShot() {
        // Enable audio immediately if not already enabled
        if (!this.isAudioEnabled) {
            this.enableAudio();
        }
        
        if (this.sounds.shot) {
            this.sounds.shot();
        }
    }
    
    playHit() {
        // Enable audio immediately if not already enabled
        if (!this.isAudioEnabled) {
            this.enableAudio();
        }
        
        if (this.sounds.hit) {
            this.sounds.hit();
        }
    }
    
    playExplosion() {
        if (this.sounds.explosion) {
            this.sounds.explosion();
        }
    }
    
    playWhoosh() {
        if (this.sounds.whoosh) {
            this.sounds.whoosh();
        }
    }
    
    playLevelComplete() {
        if (this.sounds.levelComplete) {
            this.sounds.levelComplete();
        }
    }
    
    startMusic() {
        // Simple music placeholder - could be expanded later
        console.log('Music would start here');
    }
    
    stopMusic() {
        console.log('Music would stop here');
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        this.saveSettings();
    }
    
    toggleSfx() {
        this.isSfxEnabled = !this.isSfxEnabled;
        this.saveSettings();
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem('doveHuntAudio');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.musicVolume = parsed.musicVolume ?? 0.3;
                this.sfxVolume = parsed.sfxVolume ?? 0.6;
                this.isMusicEnabled = parsed.isMusicEnabled ?? true;
                this.isSfxEnabled = parsed.isSfxEnabled ?? true;
            }
        } catch (error) {
            console.warn('Error loading audio settings:', error);
        }
    }
    
    saveSettings() {
        try {
            const settings = {
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                isMusicEnabled: this.isMusicEnabled,
                isSfxEnabled: this.isSfxEnabled
            };
            localStorage.setItem('doveHuntAudio', JSON.stringify(settings));
        } catch (error) {
            console.warn('Error saving audio settings:', error);
        }
    }
}

// Singleton instance
let instance = null;

export default {
    getInstance(scene) {
        if (!instance) {
            instance = new SimpleAudioManager(scene);
        } else {
            instance.scene = scene; // Update scene reference
        }
        return instance;
    }
};
