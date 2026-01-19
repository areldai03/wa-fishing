'use client';

import { useEffect, useRef } from 'react';
import { Game } from '@/lib/game/Game';
import { useGameStore } from '@/lib/store';
import { GameState } from '@/data/types';

export default function FishingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const frameIdRef = useRef<number>(0);
    const currentStageId = useGameStore((state) => state.currentStageId);
    const isResultModalOpen = useGameStore((state) => state.isResultModalOpen);

    // Effect to handle stage changes
    useEffect(() => {
        if (gameRef.current && currentStageId) {
            gameRef.current.changeStage(currentStageId);
        }
    }, [currentStageId]);

    // Effect to handle result modal closing
    useEffect(() => {
        if (!isResultModalOpen && gameRef.current) {
            // Only dismiss if we are in CAUGHT state (meaning we just finished showing result)
            if (gameRef.current.gameState === GameState.CAUGHT) {
                gameRef.current.dismissResult();
            }
        }
    }, [isResultModalOpen]);
     
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Initialize Game
        const game = new Game();
        gameRef.current = game;

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Loop
        const loop = () => {
            if (!gameRef.current) return; 
            
            const width = canvas.width;
            const height = canvas.height;

            gameRef.current.update(width, height);
            gameRef.current.draw(ctx, width, height);
            
            frameIdRef.current = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frameIdRef.current);
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!gameRef.current) return;
        gameRef.current.setInput({
            x: e.clientX,
            y: e.clientY,
            down: true,
            click: true
        });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!gameRef.current) return;
        // e.buttons === 1 check might be needed for 'drag' if checking outside of down?
        // But for simply tracking mouse pos, just update x/y.
        gameRef.current.setInput({
            x: e.clientX,
            y: e.clientY
        });
    };

    const handlePointerUp = () => {
        if (!gameRef.current) return;
        gameRef.current.setInput({
            down: false
        });
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full z-10 touch-none block"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
}
