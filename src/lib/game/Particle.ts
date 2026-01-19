import { StageData } from '@/data/types';

export type ParticleType = 'sakura' | 'ripple' | 'splash' | 'sparkle';

export class Particle {
    x: number;
    y: number;
    type: ParticleType;
    life: number;
    vx: number;
    vy: number;
    size: number = 0;
    maxSize: number = 0;
    angle: number = 0;
    spin: number = 0;

    constructor(x: number, y: number, type: ParticleType, stage: StageData) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        
        if (type === 'sakura') {
            this.size = Math.random() * 5 + 3;
            this.vx = Math.random() * 1 + 0.5;
            this.vy = Math.random() * 1 + 0.5;
            this.angle = Math.random() * Math.PI;
            this.spin = (Math.random() - 0.5) * 0.1;
        } else if (type === 'ripple') {
            this.size = 0;
            this.maxSize = 30 + Math.random() * 20;
            this.vx += stage.flow;
        } else if (type === 'splash') {
            this.vy = -Math.random() * 3 - 2;
            this.vx += stage.flow * 0.5;
            this.life = 1.0;
        }
    }

    update(stage: StageData, frames: number) {
        this.life -= 0.01;
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'sakura') {
            this.angle += this.spin;
            this.x += Math.sin(frames * 0.01) * 0.5;
        } else if (this.type === 'ripple') {
            this.size += 0.5;
            this.life -= 0.015;
        } else if (this.type === 'splash') {
            this.vy += 0.2;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        if (this.type === 'sakura') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = '#ffcce0';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'ripple') {
            ctx.strokeStyle = `rgba(200, 230, 255, ${Math.max(0, this.life)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'sparkle') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'splash') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
