import { FishType, StageData, Bobber } from '@/data/types';
import { FISH_TYPES } from '@/data/constants';
import { Particle } from './Particle';

export class Fish {
    x: number = 0;
    y: number = 0;
    vx: number = 0;
    vy: number = 0;
    type!: FishType;
    size: number = 0;
    scale: number = 1;
    angle: number = 0;
    target: { x: number; y: number } | null = null;
    state: 'idle' | 'chasing' | 'hooked' | 'caught' = 'idle';
    color: string = '';
    personalitySpeed: number = 1;
    wanderPhase: number = 0;

    constructor(stage: StageData, width: number, height: number) {
        this.reset(stage, width, height);
    }

    reset(stage: StageData, width: number, height: number) {
        const availableTypes = FISH_TYPES.filter(t => stage.fishTypes.includes(t.id));
        // Fallback if no types match (shouldn't happen with correct config)
        const typeData = availableTypes.length > 0
            ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
            : FISH_TYPES[0];
        
        this.type = typeData;
        this.size = Math.floor(this.type.minSize + Math.random() * (this.type.maxSize - this.type.minSize));
        this.scale = (this.size / 50) * 1.3; 
        if (this.type.id === 'kingyo' || this.type.id === 'demekin') this.scale *= 1.5;

        // Use passed width/height or defaults
        const w = width || 800;
        const h = height || 600;
        
        if (stage.flow > 0 && Math.random() < 0.5) {
            this.x = -50;
        } else {
            this.x = Math.random() * w;
        }
        
        this.y = Math.random() * (h * 0.4) + h * 0.4;
        this.vx = (Math.random() - 0.5) * this.type.speed;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.vx += stage.flow * 0.5;

        this.angle = 0;
        this.target = null;
        this.state = 'idle';
        this.color = this.type.color;
        this.personalitySpeed = 0.8 + Math.random() * 0.4;
        this.wanderPhase = Math.random() * Math.PI * 2;
    }

    update(stage: StageData, width: number, height: number, frames: number, bobber: Bobber | null, particles: Particle[]) {
        if (this.state === 'hooked') {
            this.vx += (Math.random() - 0.5) * 2;
            this.vy += (Math.random() - 0.5) * 2;
            this.vx += stage.flow * 0.1;
            
            const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
            if (speed > 5) { this.vx *= 0.9; this.vy *= 0.9; }

            this.x += this.vx;
            this.y += this.vy;
            if (Math.random() < 0.1) particles.push(new Particle(this.x, this.y, 'splash', stage));
            this.angle = Math.atan2(this.vy, this.vx);
            return;
        }

        if (this.state === 'chasing' && bobber) {
            const dx = bobber.x - this.x;
            const dy = bobber.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 15) {
                // Arrived at bobber
            } else {
                const baseSpeed = 1.8 * this.personalitySpeed;
                const wiggle = Math.sin(frames * 0.1 + this.wanderPhase) * 0.5;
                let moveX = (dx / dist) * baseSpeed;
                const moveY = (dy / dist) * baseSpeed;
                moveX += stage.flow * 0.2;
                this.vx = moveX - wiggle * (dy/dist) * 0.2;
                this.vy = moveY + wiggle * (dx/dist) * 0.2;
            }
        } else {
            // Updated Wander Logic: Continous swimming
            this.wanderPhase += (Math.random() - 0.5) * 0.1;
            
            // Base speed calculation
            const baseSpeed = this.type.speed * this.personalitySpeed * 0.8;
            
            // Calculate target velocity based on wander phase (angle)
            // Use wanderPhase as the target direction angle
            const targetVx = Math.cos(this.wanderPhase) * baseSpeed;
            const targetVy = Math.sin(this.wanderPhase) * baseSpeed * 0.3; // Limit vertical movement
            
            // Smoothly interpolate current velocity towards target
            this.vx += (targetVx - this.vx) * 0.05;
            this.vy += (targetVy - this.vy) * 0.05;

            // Apply water flow interaction (fish tends to fight flow or drift)
            // If facing against flow, slow down? Or drift with it.
            // Let's add flow drift.
            this.x += stage.flow * 0.8;
            
            // Keep bounds with gentle turnover
            const margin = 100;
            if (this.x < -margin && this.vx < 0) {
                 // Teleport to other side for continuous river feel
                 this.x = width + margin;
            } else if (this.x > width + margin && this.vx > 0) {
                 this.x = -margin;
            }
            
            // Vertical bounds bounce
            const waterLevel = height * (stage.waterY ?? 0.35);
            if (this.y < waterLevel) this.vy += 0.05; 
            if (this.y > height * 0.9) this.vy -= 0.05;
        }

        this.x += this.vx; 
        this.y += this.vy;
        // Reduced friction for continuous swim
        this.vx *= 0.995; 
        this.vy *= 0.995;

        // Wrap around logic handles X, just clamp Y here
        const waterLevel = height * (stage.waterY ?? 0.35);
        if (this.y < waterLevel) { this.y = waterLevel; this.vy = Math.abs(this.vy); }
        if (this.y > height - 50) { this.y = height - 50; this.vy = -Math.abs(this.vy); }

        // Update angle to face movement direction, but smooth it out
        // Only update angle if moving significantly to avoid jitter
        if (Math.hypot(this.vx, this.vy) > 0.1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }
    }

    // Updated drawing method for better fish design
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Determine facing direction based on velocity
        // If vx > 0, we want to face Right.
        // If vx < 0, we want to face Left.
        // The fish is drawn facing Right by default?
        // Let's check drawDetailedBody.
        // drawDetailedBody draws nose at -len*0.5 to len*0.5?
        // Standard fish: Nose to Tail (-0.5 to 0.5?) or opposite?
        // Standard fish body code:
        // ctx.moveTo(len * 0.5, 0); // Nose?
        // ...
        // ctx.bezierCurveTo(..., -len * 0.5, 0); // Tail?
        // If nose is at +0.5, it faces RIGHT natively.
        
        const isFacingRight = this.vx >= 0;
        
        // If moving right (vx > 0), we want nose (len*0.5) to be forward.
        // Angle atan2(vy, vx) gives direction.
        
        if (isFacingRight) {
             // Moving Right
             // Rotate by angle. angle is roughly 0.
             ctx.rotate(this.angle);
             // No flip needed if native is Right.
        } else {
             // Moving Left
             // We want to flip it horizontally.
             ctx.scale(-1, 1);
             // Angle is roughly PI.
             // If we flip X, we are now in localized right-facing space again?
             // If actual angle is PI-0.1 (Left + slightly Up), 
             // flipping X makes it 0-0.1?
             // Math.atan2(vy, vx) for (-1, -0.1) is roughly -3.04 (almost -PI).
             // If we rotate by -3.04, we are pointing Left.
             // Then we flip X? That might weirdly invert y rotation.
             
             // Alternative: Always rotate to velocity, check if we need to flip Y (upside down) or just rely on rotate?
             // Usually for side-scrolling fish:
             // Face direction of X motion.
             // Rotate slightly to match slope.
             
             const slope = Math.atan2(this.vy, Math.abs(this.vx));
             ctx.rotate(slope);
        }

        const len = this.size;
        const wid = this.size * 0.4;
        
        // Shadow for depth
        const rarity = this.type.rarity || 1;
        ctx.shadowBlur = (this.state === 'hooked' || rarity >= 4) ? 20 : 0;
        ctx.shadowColor = this.type.color === 'gold' ? '#ffd700' : this.type.color === 'pattern' ? '#ffaa00' : this.type.color;

        // Color handling
        if (this.color === 'pattern') {
             const grad = ctx.createLinearGradient(-len/2, 0, len/2, 0);
             grad.addColorStop(0, '#fff'); 
             grad.addColorStop(0.3, '#f00'); 
             grad.addColorStop(0.6, '#000');
             grad.addColorStop(1, '#fff');
             ctx.fillStyle = grad;
             this.drawDetailedBody(ctx, len, wid);
        } else if (this.color === 'gold') {
             const grad = ctx.createLinearGradient(-len/2, 0, len/2, 0);
             grad.addColorStop(0, '#ffd700'); 
             grad.addColorStop(0.5, '#fff'); 
             grad.addColorStop(1, '#ffd700');
             ctx.fillStyle = grad; 
             this.drawDetailedBody(ctx, len, wid);
        } else {
            ctx.fillStyle = this.color; 
            this.drawDetailedBody(ctx, len, wid);
        }

        // Restore context
        ctx.restore();
    }

    private drawDetailedBody(ctx: CanvasRenderingContext2D, len: number, wid: number) {
        const isGoldfish = this.type.id === 'kingyo' || this.type.id === 'demekin';
        
        // Reset path for stroke
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';

        if (isGoldfish) {
            // Goldfish Body (Teardrop shape)
            ctx.beginPath();
            ctx.moveTo(len * 0.4, 0);
            ctx.bezierCurveTo(len * 0.3, -wid * 0.8, -len * 0.3, -wid * 0.6, -len * 0.4, 0);
            ctx.bezierCurveTo(-len * 0.3, wid * 0.6, len * 0.3, wid * 0.8, len * 0.4, 0);
            ctx.fill();
            ctx.stroke();

            // Goldfish Tail (Flowing butterfly)
            ctx.beginPath();
            ctx.moveTo(-len * 0.3, 0);
            
            // Upper tail lobe
            const tailWiggle = Math.sin(Date.now() * 0.005 + this.x * 0.01) * 5;
            ctx.bezierCurveTo(
                -len * 0.8, -wid * 0.5, 
                -len * 1.2, -wid * 1.5 + tailWiggle, 
                -len * 1.6, -wid * 0.8 + tailWiggle
            );
            ctx.quadraticCurveTo(-len * 1.0, 0, -len * 0.4, 0);
            
            // Lower tail lobe
            ctx.moveTo(-len * 0.3, 0);
            ctx.bezierCurveTo(
                -len * 0.8, wid * 0.5, 
                -len * 1.2, wid * 1.5 + tailWiggle, 
                -len * 1.6, wid * 0.8 + tailWiggle
            );
            ctx.quadraticCurveTo(-len * 1.0, 0, -len * 0.4, 0);
            
            // Tail transparency
            const originalFill = ctx.fillStyle;
            if (typeof originalFill === 'string' && !originalFill.startsWith('#')) {
                 //Gradient or pattern: keep as is or make slight alpha
            } else if (typeof originalFill === 'string') {
                 // Simple color: add alpha
                 ctx.fillStyle = originalFill + 'aa';
            }
            ctx.fill();
            ctx.fillStyle = originalFill; // Restore
            ctx.stroke();

        } else {
            // Standard Fish Body (Streamlined)
            ctx.beginPath();
            // Nose to Tail
            ctx.moveTo(len * 0.5, 0);
            ctx.bezierCurveTo(
                len * 0.2, -wid * 0.7, 
                -len * 0.3, -wid * 0.7, 
                -len * 0.5, 0
            );
            ctx.bezierCurveTo(
                -len * 0.3, wid * 0.7, 
                len * 0.2, wid * 0.7, 
                len * 0.5, 0
            );
            ctx.fill();
            ctx.stroke();

            // Tail Fin (Forked)
            ctx.beginPath();
            ctx.moveTo(-len * 0.4, 0);
            ctx.lineTo(-len * 0.7, -wid * 0.6);
            ctx.quadraticCurveTo(-len * 0.6, 0, -len * 0.7, wid * 0.6);
            ctx.lineTo(-len * 0.4, 0);
            ctx.fill();
            ctx.stroke();
            
            // Dorsal Fin (Top)
            ctx.beginPath();
            ctx.moveTo(len * 0.1, -wid * 0.45);
            ctx.quadraticCurveTo(0, -wid * 0.9, -len * 0.2, -wid * 0.4);
            ctx.fill();

            // Pectoral Fin (Side)
            ctx.beginPath();
            ctx.moveTo(len * 0.1, wid * 0.1);
            ctx.quadraticCurveTo(0, wid * 0.6, -len * 0.1, wid * 0.2);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
            
            // Restore fill style
             if (this.color === 'pattern') {
                // already set
             } else if (this.color === 'gold') {
                // already set
             } else {
                 ctx.fillStyle = this.color;
             }
        }

        // Eye
        const eyeX = len * 0.3;
        const eyeY = -wid * 0.15;
        const eyeSize = isGoldfish ? 3 * this.scale : 2 * this.scale;

        // Demekin Pop-eye
        if (this.type.id === 'demekin') {
             ctx.fillStyle = '#0a0a0a';
             ctx.beginPath();
             ctx.arc(eyeX, -wid * 0.3, eyeSize * 1.5, 0, Math.PI*2);
             ctx.fill();
        }

        ctx.fillStyle = '#fff'; 
        ctx.beginPath(); 
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI*2); 
        ctx.fill();
        
        ctx.fillStyle = '#000'; 
        ctx.beginPath(); 
        ctx.arc(eyeX + 1, eyeY, eyeSize * 0.5, 0, Math.PI*2); 
        ctx.fill();

        // High light on eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(eyeX + eyeSize*0.3, eyeY - eyeSize*0.3, eyeSize * 0.2, 0, Math.PI*2);
        ctx.fill();
        
        // Gills (Standard fish only)
        if (!isGoldfish) {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(len * 0.15, 0, wid * 0.4, -Math.PI/3, Math.PI/3);
            ctx.stroke();
        }
    }
}
