export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.6;
        this.isMusicEnabled = true;
        this.isSfxEnabled = true;
        
        // Get saved preferences from localStorage
        this.loadSettings();
    }
    
    // Generate procedural audio using Web Audio API
    static generateAudioBuffer(audioContext, frequency, duration, type = 'sine', fadeOut = true) {
        const sampleRate = audioContext.sampleRate;
        const numSamples = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    sample = 2 * (t * frequency % 1) - 1;
                    break;
                case 'triangle':
                    const phase = t * frequency % 1;
                    sample = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
                    break;
                case 'noise':
                    sample = Math.random() * 2 - 1;
                    break;
            }
            
            // Apply fade out
            if (fadeOut && i > numSamples * 0.7) {
                const fadeRatio = 1 - (i - numSamples * 0.7) / (numSamples * 0.3);
                sample *= fadeRatio;
            }
            
            channelData[i] = sample * 0.3; // Reduce volume
        }
        
        return buffer;
    }
    
    // Generate complex sound effects
    static generateShotSound(audioContext) {
        const sampleRate = audioContext.sampleRate;
        const duration = 0.15;
        const numSamples = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // Sharp attack with noise burst
            const envelope = Math.exp(-t * 20);
            const noise = (Math.random() * 2 - 1) * envelope;
            const click = Math.sin(2 * Math.PI * 1000 * t) * envelope * 0.3;
            channelData[i] = (noise + click) * 0.4;
        }
        
        return buffer;
    }
    
    static generateExplosionSound(audioContext) {
        const sampleRate = audioContext.sampleRate;
        const duration = 0.8;
        const numSamples = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);
            const noise = (Math.random() * 2 - 1) * envelope;
            const rumble = Math.sin(2 * Math.PI * 60 * t) * envelope * 0.5;
            channelData[i] = (noise + rumble) * 0.6;
        }
        
        return buffer;
    }
    
    static generateWhooshSound(audioContext) {
        const sampleRate = audioContext.sampleRate;
        const duration = 0.4;
        const numSamples = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(Math.PI * t / duration); // Bell curve
            const frequency = 200 + (1 - t / duration) * 800; // Descending pitch
            const sample = Math.sin(2 * Math.PI * frequency * t) * envelope;
            channelData[i] = sample * 0.3;
        }
        
        return buffer;
    }
    
    // Create audio files as base64 encoded WAV data
    static createWavFile(audioBuffer) {
        const length = audioBuffer.length;
        const channelData = audioBuffer.getChannelData(0);
        
        // Create WAV file buffer
        const buffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Convert float audio data to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        // Convert to base64
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return 'data:audio/wav;base64,' + btoa(binary);
    }
    
    // Generate all audio files and save them
    async generateAudioAssets() {
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            console.warn('Web Audio API not supported');
            return;
        }
        
        const AudioContextClass = AudioContext || webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        try {
            // Generate sound effect buffers
            const shotBuffer = AudioManager.generateShotSound(audioContext);
            const explosionBuffer = AudioManager.generateExplosionSound(audioContext);
            const whooshBuffer = AudioManager.generateWhooshSound(audioContext);
            const hitBuffer = AudioManager.generateAudioBuffer(audioContext, 800, 0.2, 'square');
            const flutterBuffer = AudioManager.generateAudioBuffer(audioContext, 400, 0.3, 'triangle');
            const levelCompleteBuffer = AudioManager.generateAudioBuffer(audioContext, 440, 1.0, 'sine');
            
            // Convert to WAV files
            return {
                shot: AudioManager.createWavFile(shotBuffer),
                explosion: AudioManager.createWavFile(explosionBuffer),
                whoosh: AudioManager.createWavFile(whooshBuffer),
                hit: AudioManager.createWavFile(hitBuffer),
                flutter: AudioManager.createWavFile(flutterBuffer),
                levelComplete: AudioManager.createWavFile(levelCompleteBuffer)
            };
        } catch (error) {
            console.warn('Error generating audio:', error);
            return null;
        } finally {
            audioContext.close();
        }
    }
    
    async preloadSounds() {
        try {
            // Generate and load procedural audio
            const audioData = await this.generateAudioAssets();
            if (!audioData) {
                console.warn('No audio data generated');
                return;
            }
            
            // Load each sound as a Phaser audio object
            Object.keys(audioData).forEach(key => {
                try {
                    this.scene.load.audio(key, audioData[key]);
                } catch (error) {
                    console.warn(`Failed to load ${key} sound:`, error);
                }
            });
            
            // Load simple background music (generated tone sequence)
            this.loadBackgroundMusic();
            
            // Start the load process
            this.scene.load.start();
        } catch (error) {
            console.warn('Error in preloadSounds:', error);
        }
    }
    
    loadBackgroundMusic() {
        // Generate simple background music - a calming melody
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            return;
        }
        
        const AudioContextClass = AudioContext || webkitAudioContext;
        const audioContext = new AudioContextClass();
        
        try {
            // Create a simple melody
            const melody = [440, 494, 523, 587, 659, 523, 494, 440]; // A, B, C, D, E, C, B, A
            const duration = 0.5;
            const totalDuration = melody.length * duration;
            const sampleRate = audioContext.sampleRate;
            const numSamples = sampleRate * totalDuration;
            const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
            const channelData = buffer.getChannelData(0);
            
            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                const noteIndex = Math.floor(t / duration) % melody.length;
                const noteTime = t % duration;
                const frequency = melody[noteIndex];
                
                const envelope = Math.sin(Math.PI * noteTime / duration);
                const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1;
                channelData[i] = sample;
            }
            
            const musicData = AudioManager.createWavFile(buffer);
            this.scene.load.audio('backgroundMusic', musicData);
        } catch (error) {
            console.warn('Error generating background music:', error);
        } finally {
            audioContext.close();
        }
    }
    
    init() {
        // Initialize all sounds
        try {
            this.sounds = {
                shot: this.scene.sound.add('shot', { volume: this.sfxVolume }),
                explosion: this.scene.sound.add('explosion', { volume: this.sfxVolume }),
                whoosh: this.scene.sound.add('whoosh', { volume: this.sfxVolume }),
                hit: this.scene.sound.add('hit', { volume: this.sfxVolume }),
                flutter: this.scene.sound.add('flutter', { volume: this.sfxVolume * 0.5 }),
                levelComplete: this.scene.sound.add('levelComplete', { volume: this.sfxVolume })
            };
            
            this.music = this.scene.sound.add('backgroundMusic', { 
                volume: this.musicVolume, 
                loop: true 
            });
        } catch (error) {
            console.warn('Error initializing sounds:', error);
        }
    }
    
    playShot() {
        if (this.isSfxEnabled && this.sounds.shot) {
            this.sounds.shot.play();
        }
    }
    
    playExplosion() {
        if (this.isSfxEnabled && this.sounds.explosion) {
            this.sounds.explosion.play();
        }
    }
    
    playWhoosh() {
        if (this.isSfxEnabled && this.sounds.whoosh) {
            this.sounds.whoosh.play();
        }
    }
    
    playHit() {
        if (this.isSfxEnabled && this.sounds.hit) {
            this.sounds.hit.play();
        }
    }
    
    playFlutter() {
        if (this.isSfxEnabled && this.sounds.flutter) {
            this.sounds.flutter.play();
        }
    }
    
    playLevelComplete() {
        if (this.isSfxEnabled && this.sounds.levelComplete) {
            this.sounds.levelComplete.play();
        }
    }
    
    startMusic() {
        if (this.isMusicEnabled && this.music && !this.music.isPlaying) {
            this.music.play();
        }
    }
    
    stopMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }
    }
    
    pauseMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }
    
    resumeMusic() {
        if (this.music && this.music.isPaused) {
            this.music.resume();
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.setVolume(this.musicVolume);
        }
        this.saveSettings();
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.setVolume(this.sfxVolume);
        });
        this.saveSettings();
    }
    
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        if (this.isMusicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
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
