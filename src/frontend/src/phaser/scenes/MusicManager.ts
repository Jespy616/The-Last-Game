import { type GameObjects, Scene } from 'phaser';

export class MusicManager extends Scene {
    private music: Phaser.Sound.BaseSound | null = null;
    private isMuted: boolean = false;

    constructor() {
        super({ key: 'MusicManager', active: true });
    }

    preload() {
        // Just load the audio file without configuration
        this.load.audio("YWWWS", "assets/audio/YWWWS.ogg");
    }

    create() {
        // Always start with default track
        this.startMusic();
        
        // Set up event listeners
        this.events.on('playMusic', this.playMusic, this);
        this.events.on('stopMusic', this.stopMusic, this);
        this.events.on('toggleMute', this.toggleMute, this);
    }

    startMusic() {
        // Start with default track
        this.playMusic("YWWWS");
    }

    playMusic(key: string) {
        // Stop any currently playing music
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }

        this.music = this.sound.add(key);

        this.music.addMarker({
            name: 'intro',
            start: 0,
            duration: 2.857,
            config: {
                volume: 0.15
            }
        });

        this.music.addMarker({
            name: 'loop',
            start: 2.857,
            duration: 128.0, // 130.857 - 2.857
            config: {
                loop: true,
                volume: 0.15
            }
        });
        
        // Play using the marker
        this.music.play("intro");
        this.music.once('complete', () => {
            if (this.music) {
                this.music.play("loop");
            }
        });
        
        // Apply mute state
        if (this.isMuted) {
            this.music.setMute(true);
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.music) {
            this.music.setMute(this.isMuted);
        }
        return this.isMuted;
    }

    isPlaying() {
        return this.music && this.music.isPlaying;
    }

}