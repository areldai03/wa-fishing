
const GFX = {
    drawRock: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        // Angular, rugged rock design (Low-poly style)
        const grad = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        grad.addColorStop(0, '#6e7f80'); // Grey-ish blue light
        grad.addColorStop(1, '#2F3536'); // Dark slate shadow
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(x, y - size); // Top
        ctx.lineTo(x + size * 0.7, y - size * 0.6);
        ctx.lineTo(x + size, y - size * 0.1);
        ctx.lineTo(x + size * 0.8, y + size * 0.7);
        ctx.lineTo(x + size * 0.2, y + size);
        ctx.lineTo(x - size * 0.5, y + size * 0.9);
        ctx.lineTo(x - size * 0.9, y + size * 0.3);
        ctx.lineTo(x - size, y - size * 0.4);
        ctx.closePath();
        ctx.fill();

        // Facet shading (Cuts)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // Highlight facet
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.4, y - size * 0.2);
        ctx.lineTo(x - size * 0.3, y + size * 0.1);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Shadow facet
        ctx.beginPath();
        ctx.moveTo(x - size * 0.3, y + size * 0.1);
        ctx.lineTo(x + size * 0.2, y + size);
        ctx.lineTo(x - size * 0.5, y + size * 0.9);
        ctx.fill();

        // Moss/Greenery
        ctx.fillStyle = '#4a6b4a';
        ctx.beginPath();
        // Top surface moss
        ctx.arc(x - size * 0.2, y - size * 0.8, size * 0.25, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.7, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    },
    drawCliff: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
        // Vertical rock face
        const grad = ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, '#2F3536');
        grad.addColorStop(0.5, '#4a5757');
        grad.addColorStop(1, '#2F3536');
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        
        // Mossy patches
        ctx.fillStyle = '#3a523a';
        for(let i=0; i<10; i++) {
             // Use pseudo-random seeded by position to keep it static
             const seed = x + y + i * 111.11;
             const rnd1 = Math.abs(Math.sin(seed));
             const rnd2 = Math.abs(Math.cos(seed * 1.5));
             
             const mx = x + rnd1 * w;
             const my = y + rnd2 * h;
             const mSize = Math.abs(Math.sin(seed * 0.5)) * 20 + 20;
             ctx.beginPath();
             ctx.arc(mx, my, mSize, 0, Math.PI*2);
             ctx.fill();
        }

        // Hanging vines
        ctx.strokeStyle = '#4a6b4a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            const seed = x + y + i * 222.22;
            const rnd1 = Math.abs(Math.sin(seed * 1.2));
            const rnd2 = Math.abs(Math.cos(seed * 0.8));
            
            const vx = x + rnd1 * w;
            const vy = y + rnd2 * (h/2); // Start from upper half
            const length = Math.abs(Math.sin(seed)) * 100 + 50;
            
            ctx.moveTo(vx, vy);
            // Wavy vine
            ctx.bezierCurveTo(vx - 20, vy + length/2, vx + 20, vy + length, vx, vy + length * 1.5);
        }
        ctx.stroke();

        // Draw cracks/texture
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y);
        ctx.lineTo(x + w * 0.3, y + h * 0.4);
        ctx.lineTo(x + w * 0.1, y + h * 0.7);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w * 0.8, y);
        ctx.lineTo(x + w * 0.6, y + h * 0.5);
        ctx.lineTo(x + w * 0.9, y + h * 0.9);
        ctx.stroke();
    },
    drawWaterfall: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frames: number) => {
        // Waterfall Body
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, 'rgba(230, 240, 255, 0.8)');
        grad.addColorStop(1, 'rgba(200, 220, 255, 0.4)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        
        // Falling water lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const lineX = x + (i / 5) * w + Math.sin(frames * 0.1 + i) * 5;
            const offset = (frames * 5 + i * 20) % h;
            ctx.moveTo(lineX, y + offset);
            ctx.lineTo(lineX, y + offset + 20);
        }
        ctx.stroke();

        // Splash at bottom
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for(let i=0; i<8; i++) {
            const sx = x + Math.random() * w;
            const sy = y + h - 5 + Math.random() * 10;
            const sSize = Math.random() * 5 + 2;
            ctx.beginPath();
            ctx.arc(sx, sy, sSize, 0, Math.PI*2);
            ctx.fill();
        }
    },
    drawStall: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
        // Roof (Striped)
        ctx.save();
        ctx.translate(x, y);
        
        // Pillars
        ctx.fillStyle = '#5c3a21'; // Wood
        ctx.fillRect(5, 20, 5, h-20);
        ctx.fillRect(w-10, 20, 5, h-20);
        
        // Roof stripes
        const stripeWidth = w / 5;
        for(let i=0; i<5; i++) {
            ctx.fillStyle = (i % 2 === 0) ? color : '#ffffff';
            ctx.fillRect(i * stripeWidth, 0, stripeWidth, 25);
        }
        
        // Banner/Noren
        ctx.fillStyle = '#003366';
        ctx.fillRect(5, 25, w-10, 15);
        ctx.fillStyle = 'white';
        ctx.font = '10px serif';
        ctx.fillText('氷', w/2 - 5, 36);

        ctx.restore();
    },
    drawLantern: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 15, 20, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Rims
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 10, y - 20, 20, 4); // Top
        ctx.fillRect(x - 10, y + 16, 20, 4); // Bottom
        
        // Glow center
        ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI*2);
        ctx.fill();
    },
    drawLotus: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number = 0) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.fillStyle = '#2d4a3e';
        ctx.beginPath();
        // Pacman shape for lotus leaf
        const gap = 0.4;
        ctx.arc(0, 0, size, gap, Math.PI * 2 - gap);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        // Water droplets
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(size*0.3, -size*0.3, 3, 0, Math.PI*2);
        ctx.fill();

        // Veins
        ctx.strokeStyle = '#3d6353';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(size * Math.cos(gap), size * Math.sin(gap));
        for(let i=1; i<=5; i++) {
             const a = gap + (Math.PI*2 - gap*2) * (i/6);
             ctx.moveTo(0, 0); ctx.lineTo(size * Math.cos(a), size * Math.sin(a));
        }
        ctx.stroke();
        ctx.restore();
    },
    drawLanternReflection: (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        // Wobbly reflection
        ctx.ellipse(x, y, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    },
    drawGrass: (ctx: CanvasRenderingContext2D, x: number, y: number, h: number, sway: number) => {
        ctx.strokeStyle = '#1e2e26';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + sway, y - h * 0.5, x + sway * 1.2, y - h);
        ctx.stroke();
    }
};

interface StageRenderer {
    drawBg?: (ctx: CanvasRenderingContext2D, w: number, h: number, frames: number) => void;
    drawFg?: (ctx: CanvasRenderingContext2D, w: number, h: number, frames: number) => void;
}

export const STAGE_RENDERERS: Record<string, StageRenderer> = {
    river_mouth: {
        drawBg: (ctx, w, h, frames) => {
            // Horizon Gradient (Sunset/Dusk feel)
            const horizonY = h * 0.35;
            const grad = ctx.createLinearGradient(0, horizonY - 100, 0, horizonY);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            grad.addColorStop(1, 'rgba(255, 200, 150, 0.2)'); // Horizon glow
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, horizonY);

            // Distant City Lights
            ctx.fillStyle = 'rgba(255,255,200,0.8)';
            for (let i = 0; i < 20; i++) {
                // Determine fixed position based on i, not frames (pseudo-random seeded by i)
                const x = (i * 123456) % w;
                const brightness = Math.sin(frames * 0.05 + i) * 0.5 + 0.5;
                if (Math.random() > 0.99) continue; // Flicker
                ctx.fillRect(x, horizonY - 2, 2, 2 * brightness);
                // Reflection
                ctx.fillStyle = `rgba(255,255,200,${0.2 * brightness})`;
                ctx.fillRect(x, horizonY + 2, 2, 10);
                ctx.fillStyle = 'rgba(255,255,200,0.8)'; // Reset
            }
        },
        drawFg: (ctx, w, h, frames) => {
            // Mist over water
            const grad = ctx.createLinearGradient(0, h * 0.8, 0, h);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(1, 'rgba(200,220,255,0.1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, h * 0.8, w, h * 0.2);
        }
    },
    stream: {
        drawBg: (ctx, w, h, frames) => {
            const flowOffset = (frames * 2) % 200;
            
            // Cliffs on both sides of waterfall
            // Waterfall W = w*0.2, X = w*0.4
            // Left Cliff
            GFX.drawCliff(ctx, 0, 0, w * 0.4, h * 0.4);
            // Right Cliff
            GFX.drawCliff(ctx, w * 0.6, 0, w * 0.4, h * 0.4);

            // Background Waterfall (Far back, between cliffs)
            GFX.drawWaterfall(ctx, w * 0.4, 0, w * 0.2, h * 0.4, frames);
            
            // Water Surface (Below cliffs/falls)
            const riverY = h * 0.35; // Slight overlap
            /* ...existing code... */

            // Background Rocks
            GFX.drawRock(ctx, w*0.1, h*0.30, 80);
            GFX.drawRock(ctx, w*0.3, h*0.25, 60); // More rocks near falls
            GFX.drawRock(ctx, w*0.7, h*0.25, 70);
            GFX.drawRock(ctx, w*0.85, h*0.32, 90);

            // Fast water streaks
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(let i=0; i<10; i++) {
                const y = h*0.35 + Math.random() * h;
                const x = (Math.random() * w + flowOffset * 2) % w;
                ctx.moveTo(x, y);
                ctx.lineTo(x + 50, y);
            }
            ctx.stroke();
        },
        drawFg: (ctx, w, h, frames) => {
            // Grass on banks (only if bank visible? assume immersive view)
            // Maybe falling leaves
            const leafTime = frames * 0.01;
            ctx.fillStyle = '#a8c66c';
            for(let i=0; i<5; i++) {
                const lx = (w * i/5 + Math.sin(leafTime + i)*100) % w;
                const ly = (h * 0.5 + Math.cos(leafTime * 0.7 + i)*200) % h;
                ctx.beginPath();
                ctx.ellipse(lx, ly, 6, 3, leafTime + i, 0, Math.PI*2);
                ctx.fill();
            }
        }
    },
    pond: {
        drawBg: (ctx, w, h, frames) => {
            // Floating Lotus leaves - Rotating slowly
            GFX.drawLotus(ctx, w*0.2, h*0.4, 40, Math.sin(frames*0.01)*0.1);
            GFX.drawLotus(ctx, w*0.25, h*0.45, 30, Math.cos(frames*0.01)*0.1 + 1);
            GFX.drawLotus(ctx, w*0.7, h*0.42, 50, 2);
            GFX.drawLotus(ctx, w*0.85, h*0.8, 60, 4); // Foreground-ish

            // Fireflies (if night themed pond)
            ctx.fillStyle = '#ccff00';
            for(let i=0; i<5; i++) {
                 const fx = w * 0.5 + Math.sin(frames * 0.02 + i*10) * w * 0.4;
                 const fy = h * 0.6 + Math.cos(frames * 0.03 + i*20) * h * 0.2;
                 const alpha = Math.sin(frames * 0.1 + i) * 0.5 + 0.5;
                 ctx.globalAlpha = alpha;
                 ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI*2); ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        }
    },
    festival: {
        drawBg: (ctx, w, h, frames) => {
            // Background Stalls (Yatai)
            // Draw a row of stalls at the top
            const stallWidth = 100;
            const numStalls = Math.ceil(w / stallWidth) + 1;
            for(let i = 0; i < numStalls; i++) {
                GFX.drawStall(ctx, i * stallWidth - 20, 10, stallWidth + 10, 80, 'red');
                
                // Hanging lantern on stall
                const lanternColor = i % 2 === 0 ? '#ff3333' : '#ffff66';
                GFX.drawLantern(ctx, i * stallWidth + 20, 50, lanternColor);
            }

            // Lantern reflections (Colorful)
            const pulse = Math.sin(frames * 0.05) * 0.2 + 0.8;
            GFX.drawLanternReflection(ctx, w*0.15, h*0.3, `rgba(255, 50, 50, ${0.3 * pulse})`, 80);
            GFX.drawLanternReflection(ctx, w*0.5, h*0.25, `rgba(255, 255, 100, ${0.3 * pulse})`, 100);
            GFX.drawLanternReflection(ctx, w*0.85, h*0.3, `rgba(100, 200, 255, ${0.3 * pulse})`, 80);
        },
        drawFg: (ctx, w, h, frames) => {
            // Vignette for intimacy
             const grad = ctx.createRadialGradient(w/2, h/2, h*0.4, w/2, h/2, h);
             grad.addColorStop(0, 'rgba(0,0,0,0)');
             grad.addColorStop(1, 'rgba(50,20,20,0.6)');
             ctx.fillStyle = grad;
             ctx.fillRect(0,0,w,h);
        }
    }
};
