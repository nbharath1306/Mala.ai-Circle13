export class SpatialAudio {
    private static ctx: AudioContext | null = null;
    private static binauralNodes: { oscL: OscillatorNode; oscR: OscillatorNode; gain: GainNode } | null = null;
    private static atmosphereGain: GainNode | null = null;

    public static initialize() {
        if (typeof window === 'undefined') return;

        if (!this.ctx) {
            const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextCtor) {
                this.ctx = new AudioContextCtor();
            }
        }
    }

    /**
     * Start the 432Hz Binaural Beat (Theta wave induction)
     * Left: 432Hz, Right: 436Hz -> 4Hz beat
     */
    public static startAmbience() {
        this.initialize();
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.binauralNodes) return; // Already playing

        // Master atmosphere gain
        this.atmosphereGain = this.ctx.createGain();
        this.atmosphereGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.atmosphereGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3); // Fade in
        this.atmosphereGain.connect(this.ctx.destination);

        // Left Ear (432Hz)
        const oscL = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = 432;
        const pannerL = this.ctx.createStereoPanner();
        pannerL.pan.value = -1;
        oscL.connect(pannerL).connect(this.atmosphereGain);

        // Right Ear (436Hz)
        const oscR = this.ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.value = 436; // 4Hz difference = Theta state
        const pannerR = this.ctx.createStereoPanner();
        pannerR.pan.value = 1;
        oscR.connect(pannerR).connect(this.atmosphereGain);

        oscL.start();
        oscR.start();

        this.binauralNodes = { oscL, oscR, gain: this.atmosphereGain };
    }

    /**
     * Synthesize a bell sound for milestones
     */
    public static playBell(intensity: 'light' | 'medium' | 'deep') {
        if (!this.ctx) this.initialize();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const freq = intensity === 'light' ? 2000 : intensity === 'medium' ? 1000 : 432;
        const duration = intensity === 'light' ? 2 : 5;
        const volume = intensity === 'light' ? 0.05 : 0.2;

        // Bell envelope
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        // FM Synthesis usually better for bells, but simple sine decay works for "pure" tone

        // Add harmonics for richness if 'deep'
        if (intensity === 'deep') {
            const osc2 = this.ctx.createOscillator();
            osc2.frequency.value = freq * 1.5;
            const g2 = this.ctx.createGain();
            g2.gain.value = volume * 0.5;
            osc2.connect(g2).connect(this.ctx.destination);

            g2.gain.exponentialRampToValueAtTime(0.001, t + duration);
            osc2.start(t);
            osc2.stop(t + duration);
        }

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.start(t);
        osc.stop(t + duration);
    }
}
