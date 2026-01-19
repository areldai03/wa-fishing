import { StageData, Bobber, GameState, FishType } from '@/data/types';
import { STAGES, CONFIG } from '@/data/constants';
import { Fish } from './Fish';
import { Particle } from './Particle';
import { STAGE_RENDERERS } from './StageRenderer';
import { useGameStore } from '@/lib/store';
import { soundManager } from '@/lib/sound/SoundManager';

export interface GameInput {
    x: number;
    y: number;
    down: boolean;
    click: boolean;
}

export class Game {
    fish: Fish[] = [];
    particles: Particle[] = [];
    bobber: Bobber = { x: 0, y: 0, vx: 0, vy: 0, submerged: false };
    
    currentStage: StageData;
    gameState: GameState = GameState.MENU;
    
    score: number = 0;
    caughtHistory: Set<string> = new Set();
    
    frames: number = 0;
    tension: number = 0;
    targetFish: Fish | null = null;
    biteTimer: number = 0;
    
    hint: string = "画面をタップしてキャスト";
    flash: number = 0;
    
    input: GameInput = { x: 0, y: 0, down: false, click: false };

    // Event hooks (optional, for UI integration)
    onFishCaught?: (fish: Fish) => void;

    constructor() {
        this.currentStage = STAGES.river_mouth;
        this.reset();
        // Don't call changeStage here, let it be driven by store or init
        // But for safety:
        this.fish = [];
        this.changeStage(this.currentStage.id);
    }

    changeStage(stageId: string) {
        if (STAGES[stageId]) {
            this.currentStage = STAGES[stageId];
        }
        this.fish = [];
        // Spawn fish with safe default coordinates
        for(let i=0; i<this.currentStage.fishCount; i++) {
            this.fish.push(new Fish(this.currentStage, 800, 600));
        }
        this.reset();
        this.particles = [];
        this.gameState = GameState.IDLE;
    }

    reset() {
        this.bobber = { x: 0, y: 0, vx: 0, vy: 0, submerged: false };
        this.tension = 0;
        this.targetFish = null;
        this.updateHint("画面をタップしてキャスト");
        this.flash = 0;
    }

    private updateHint(text: string) {
        if (this.hint === text) return;
        this.hint = text;
        useGameStore.getState().setHint(text);
    }

    // Improved cast method to match original logic
    private performCast(targetX: number, targetY: number, width: number, height: number) {
        this.gameState = GameState.CASTING;
        soundManager.playSE('cast');
        this.bobber.x = width / 2;
        this.bobber.y = height - 50;
        
        const time = 45;
        const finalTargetY = Math.max(targetY, height * 0.35);
        const dX = targetX - this.bobber.x;
        const dY = finalTargetY - this.bobber.y;
        
        this.bobber.vx = dX / time;
        this.bobber.vy = (dY - 0.5 * CONFIG.gravity * time * time) / time;
        this.updateHint("着水を待て");
    }

    setInput(input: Partial<GameInput>) {
        this.input = { ...this.input, ...input };
    }

    update(width: number, height: number) {
        if (this.gameState === GameState.MENU) return;

        // Check for modal equivalent pause? 
        // In React, we might control this via prop "isPaused" passed to update
        // For now ignore pause logic.

        switch(this.gameState) {
            case GameState.IDLE:
                if (this.input.click) { 
                    this.performCast(this.input.x, this.input.y, width, height); 
                    this.input.click = false; 
                }
                break;
            
            case GameState.CASTING:
                this.bobber.vy += CONFIG.gravity;
                this.bobber.x += this.bobber.vx;
                this.bobber.y += this.bobber.vy;
                if (this.bobber.vy > 0 && this.bobber.y > height * 0.35) {
                     this.gameState = GameState.WAITING;
                     this.bobber.vy = 0; this.bobber.vx = 0; this.bobber.submerged = true;
                     this.particles.push(new Particle(this.bobber.x, this.bobber.y, 'ripple', this.currentStage));
                     this.particles.push(new Particle(this.bobber.x, this.bobber.y, 'splash', this.currentStage));
                     this.updateHint("長押しでリールを巻く");
                }
                break;

            case GameState.WAITING:
                this.bobber.x += this.currentStage.flow;
                if (this.bobber.x > width + 50) this.bobber.x = -50;
                this.bobber.y += Math.sin(this.frames * 0.1) * 0.5;
                
                if (this.input.down) {
                    const tx = width / 2; const ty = height;
                    this.bobber.x += (tx - this.bobber.x) * 0.05;
                    this.bobber.y += (ty - this.bobber.y) * 0.05;
                    this.bobber.y -= 1;
                    if (this.bobber.y > height - 100) {
                        this.gameState = GameState.IDLE; 
                        this.reset(); 
                        this.updateHint("画面をタップしてキャスト"); 
                        this.input.down = false; 
                        return;
                    }
                } else {
                    this.bobber.y = Math.min(this.bobber.y + 0.5, height * 0.8);
                }

                let chasers = 0;
                this.fish.forEach(f => { if(f.state === 'chasing') chasers++; });

                this.fish.forEach(f => {
                    const d = Math.hypot(f.x - this.bobber.x, f.y - this.bobber.y);
                    if (f.state === 'idle' && d < 400 && chasers < 2 && Math.random() < 0.005) {
                        f.state = 'chasing'; chasers++;
                    }
                    if (f.state === 'chasing') {
                        const dist = Math.hypot(f.x - this.bobber.x, f.y - this.bobber.y);
                        if (dist < 25) {
                            this.gameState = GameState.BITING; 
                            this.targetFish = f; 
                            this.biteTimer = 120; 
                            this.updateHint("引いている！タップ！");
                            soundManager.playSE('menu'); // Subtle alert
                        }
                    }
                });
                break;

            case GameState.BITING:
                this.biteTimer--;
                this.bobber.y += Math.sin(this.frames * 1.5) * 4;
                this.bobber.x += this.currentStage.flow;
                this.particles.push(new Particle(this.bobber.x, this.bobber.y, 'ripple', this.currentStage));

                if (this.input.click || this.input.down) {
                    this.gameState = GameState.HOOKED; 
                    if (this.targetFish) this.targetFish.state = 'hooked'; 
                    this.updateHint("ホールドで巻く / 離して緩める"); 
                    this.flash = 20; 
                    this.input.click = false; 
                    soundManager.playSE('hit');
                } else if (this.biteTimer <= 0) {
                    this.gameState = GameState.WAITING; 
                    if (this.targetFish) {
                        this.targetFish.state = 'idle'; 
                        this.targetFish.vx = (Math.random()-0.5)*20; 
                    }
                    this.targetFish = null; 
                    this.updateHint("逃げられた...");
                }
                break;

            case GameState.HOOKED:
                if (!this.targetFish) {
                    this.gameState = GameState.IDLE;
                    this.reset();
                    break;
                }
                const f = this.targetFish;
                f.x = this.bobber.x; f.y = this.bobber.y + 20;
                this.bobber.x += this.currentStage.flow * 0.2;

                if (this.input.down) {
                    this.tension += CONFIG.tensionIncrease * f.type.power;
                    this.bobber.y += (height - 50 - this.bobber.y) * 0.03;
                    this.bobber.x += (width/2 - this.bobber.x) * 0.02;
                } else {
                    this.tension -= CONFIG.tensionRecovery;
                    this.bobber.y -= 2;
                    this.bobber.x += (Math.random()-0.5)*5;
                }
                this.tension = Math.max(0, this.tension);
                
                if (this.bobber.y > height - 120) {
                    this.gameState = GameState.CAUGHT; 
                    this.handleCatch(f);
                }
                if (this.tension >= CONFIG.tensionLimit) {
                    this.gameState = GameState.BROKEN; 
                    this.updateHint("糸が切れた...");
                    // Use arrow function in setTimeout to preserve 'this'
                    setTimeout(() => { 
                        this.gameState = GameState.IDLE; 
                        this.reset(); 
                        f.reset(this.currentStage, width, height); 
                    }, 2000);
                }
                if (this.bobber.y < height * 0.2) {
                     this.gameState = GameState.IDLE; 
                     this.reset(); 
                     f.reset(this.currentStage, width, height);
                }
                break;
        }

        this.frames++;
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(this.currentStage, this.frames);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update fish
        this.fish.forEach(f => f.update(
            this.currentStage, 
            width, 
            height, 
            this.frames, 
            this.bobber.submerged ? this.bobber : null,
            this.particles
        ));

        // Ambient particles
        if (this.frames % 10 === 0 && this.currentStage.id !== 'festival') {
            this.particles.push(new Particle(Math.random()*width, -10, 'sakura', this.currentStage));
        }
        if (this.frames % 30 === 0) {
            this.particles.push(new Particle(
                Math.random()*width, 
                Math.random()*height*0.3 + height*0.3, 
                'sparkle', 
                this.currentStage
            ));
        }
        
        this.input.click = false; 
    }

    handleCatch(fish: Fish) {
        if (!this.caughtHistory.has(fish.type.id)) this.caughtHistory.add(fish.type.id);
        this.score += fish.size / 100 * fish.type.speed;
        
        soundManager.playSE('catch');

        // Update Store
        const store = useGameStore.getState();
        store.addScore(fish.size / 100 * fish.type.speed);
        store.addCaughtFish(fish.type.id);
        store.openResultModal(fish);

        // Respawn fish after delay
        const idx = this.fish.indexOf(fish); 
        this.fish.splice(idx, 1);
        setTimeout(() => {
            this.fish.push(new Fish(this.currentStage, 800, 600)); // Need width/height actually
        }, 3000); 
    }

    dismissResult() {
        this.reset();
        this.gameState = GameState.IDLE;
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        // Background
        const gradStops = this.currentStage.bgGradient;
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, gradStops[0]); 
        grad.addColorStop(0.3, gradStops[1]); 
        grad.addColorStop(0.31, gradStops[2]); 
        grad.addColorStop(1, gradStops[3]); 
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Stage Custom Background
        const renderer = STAGE_RENDERERS[this.currentStage.id];
        if (renderer && renderer.drawBg) renderer.drawBg(ctx, width, height, this.frames);

        // Moon
        if (this.currentStage.id !== 'festival') {
            ctx.shadowBlur = 50; ctx.shadowColor = '#ffeeb0'; ctx.fillStyle = '#ffeeb0';
            ctx.beginPath(); ctx.arc(width * 0.8, height * 0.15, 40, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        }

        // Water Reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for(let i=0; i<5; i++) {
            ctx.beginPath();
            const y = height * 0.35 + 50 * i + Math.sin(this.frames * 0.02 + i) * 10;
            ctx.rect(0, y, width, 20); ctx.fill();
        }

        // Draw Fish
        this.fish.forEach(f => f.draw(ctx));

        // Foreground Stage Elements
        if (renderer && renderer.drawFg) renderer.drawFg(ctx, width, height, this.frames);

        // Draw Line & Bobber
        if (this.gameState !== GameState.IDLE && this.gameState !== GameState.MENU) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(width/2, height); 
            let cpY = (height + this.bobber.y) / 2;
            if (this.gameState === GameState.WAITING && !this.input.down) cpY += 100;
            if (this.gameState === GameState.HOOKED && this.input.down) cpY = (height + this.bobber.y) / 2;
            ctx.quadraticCurveTo((width/2 + this.bobber.x)/2, cpY, this.bobber.x, this.bobber.y); ctx.stroke();
            
            ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(this.bobber.x, this.bobber.y, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.bobber.x, this.bobber.y - 3, 6, 0, Math.PI, true); ctx.fill();
        }

        // Gauge
        if (this.gameState === GameState.HOOKED) {
            const pct = this.tension / CONFIG.tensionLimit;
            const color = pct > 0.8 ? '#ff0000' : pct > 0.5 ? '#ffff00' : '#00ff00';
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 8;
            ctx.beginPath(); ctx.arc(this.bobber.x, this.bobber.y, 40, 0, Math.PI*2); ctx.stroke();
            ctx.strokeStyle = color;
            ctx.beginPath(); ctx.arc(this.bobber.x, this.bobber.y, 40, -Math.PI/2, -Math.PI/2 + (Math.PI*2 * pct)); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 24px "Shippori Mincho"'; ctx.textAlign = 'center'; ctx.fillText("引け！", this.bobber.x, this.bobber.y - 50);
        }

        this.particles.forEach(p => p.draw(ctx));

        if (this.flash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flash/20})`; ctx.fillRect(0,0,width,height); this.flash--;
        }
        
        const gradient = ctx.createRadialGradient(width/2, height/2, height/2, width/2, height/2, height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)'); gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = gradient; ctx.fillRect(0,0,width,height);
    }
}
