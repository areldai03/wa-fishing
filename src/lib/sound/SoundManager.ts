class SoundManager {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private bgmSource: AudioBufferSourceNode | null = null;
    private bgmGain: GainNode | null = null;
    private buffers: Map<string, AudioBuffer> = new Map();
    private isMuted: boolean = false;
    private volume: number = 0.5;

    constructor() {
        if (typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                this.context = new AudioContextClass();
                this.masterGain = this.context.createGain();
                this.masterGain.connect(this.context.destination);
                this.masterGain.gain.value = this.volume;
                
                this.bgmGain = this.context.createGain();
                if (this.masterGain) {
                    this.bgmGain.connect(this.masterGain);
                }
            }
        }
    }

    public async loadSound(name: string, url: string) {
        if (!this.context) return;
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (error) {
            console.error(`Failed to load sound: ${name}`, error);
        }
    }

    // Generate synth sound for placeholders
    public playSynthSE(type: 'cast' | 'hit' | 'catch' | 'menu') {
        if (!this.context || !this.masterGain) return;
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.context.currentTime;

        if (type === 'cast') {
            // Swoosh sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'hit') {
            // Sudden alert
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'catch') {
            // Success jingle (arpeggio)
            this.playTone(523.25, now, 0.1); // C5
            this.playTone(659.25, now + 0.1, 0.1); // E5
            this.playTone(783.99, now + 0.2, 0.2); // G5
        } else if (type === 'menu') {
            // Click
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    }

    private playTone(freq: number, time: number, duration: number) {
        if (!this.context || !this.masterGain) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }

    public playSE(name: string) {
        if (!this.context || !this.masterGain) return;
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const buffer = this.buffers.get(name);
        if (buffer) {
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.masterGain);
            source.start(0);
        } else {
            // Fallback for demo purposes if file not loaded
            const validTypes = ['cast', 'hit', 'catch', 'menu'] as const;
            if (validTypes.some(type => type === name)) {
                this.playSynthSE(name as typeof validTypes[number]);
            }
        }
    }

    public setVolume(val: number) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
}

export const soundManager = new SoundManager();
