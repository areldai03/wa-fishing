import { StageData } from '@/data/types';

const GFX = {
    drawRock: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        ctx.fillStyle = '#2a3b35';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * 0.4, y - size * 0.6);
        ctx.lineTo(x + size * 0.8, y - size * 0.2);
        ctx.lineTo(x + size * 1.2, y - size * 0.5);
        ctx.lineTo(x + size * 1.6, y);
        ctx.closePath();
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.4, y - size * 0.6);
        ctx.lineTo(x + size * 0.5, y - size * 0.2);
        ctx.lineTo(x + size * 0.2, y);
        ctx.fill();
    },
    drawLotus: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        ctx.fillStyle = '#2d4a3e';
        ctx.beginPath();
        // Pacman shape for lotus leaf
        ctx.arc(x, y, size, 0.2, Math.PI * 2 - 0.2);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        // Veins
        ctx.strokeStyle = '#3d6353';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + size, y);
        ctx.moveTo(x, y); ctx.lineTo(x, y + size);
        ctx.moveTo(x, y); ctx.lineTo(x - size, y);
        ctx.moveTo(x, y); ctx.lineTo(x, y - size);
        ctx.stroke();
    },
    drawLanternReflection: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 60);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, 60, 20, 0, 0, Math.PI * 2);
        ctx.fill();
    }
};

interface StageRenderer {
    drawBg?: (ctx: CanvasRenderingContext2D, w: number, h: number, frames: number) => void;
    drawFg?: (ctx: CanvasRenderingContext2D, w: number, h: number, frames: number) => void;
}

export const STAGE_RENDERERS: Record<string, StageRenderer> = {
    river_mouth: {
        drawBg: (ctx, w, h, frames) => {
            // Distant city lights or horizon
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(0, h*0.34, w, 2);
        }
    },
    stream: {
        drawBg: (ctx, w, h, frames) => {
            // Rocks in background
            GFX.drawRock(ctx, w*0.1, h*0.35, 80);
            GFX.drawRock(ctx, w*0.5, h*0.32, 120);
            GFX.drawRock(ctx, w*0.8, h*0.36, 60);
        },
        drawFg: (ctx, w, h, frames) => {
            // Underwater rocks (foreground)
            ctx.fillStyle = 'rgba(20, 30, 25, 0.4)'; // Dark silhouette
            ctx.beginPath();
            ctx.ellipse(w*0.2, h, 200, 100, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(w*0.9, h*0.9, 150, 80, 0, 0, Math.PI*2);
            ctx.fill();
        }
    },
    pond: {
        drawBg: (ctx, w, h, frames) => {
            // Floating Lotus leaves
            GFX.drawLotus(ctx, w*0.2, h*0.4, 40);
            GFX.drawLotus(ctx, w*0.25, h*0.45, 30);
            GFX.drawLotus(ctx, w*0.7, h*0.42, 50);
            GFX.drawLotus(ctx, w*0.85, h*0.8, 60); // Foreground-ish
        }
    },
    festival: {
        drawBg: (ctx, w, h, frames) => {
            // Lantern reflections
            const pulse = Math.sin(frames * 0.05) * 0.2 + 0.8;
            GFX.drawLanternReflection(ctx, w*0.2, h*0.3, `rgba(255, 200, 100, ${0.1 * pulse})`);
            GFX.drawLanternReflection(ctx, w*0.8, h*0.2, `rgba(255, 100, 100, ${0.1 * pulse})`);
            
            // Tub rim illusion
            ctx.strokeStyle = '#5c3a3a';
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc(w/2, h/2, Math.max(w,h)*0.8, 0, Math.PI*2);
            ctx.stroke();
        }
    }
};
