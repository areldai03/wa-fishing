'use client';

import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function Header() {
    const score = useGameStore((state) => state.score);
    const openStageModal = useGameStore((state) => state.openStageModal);
    const openBookModal = useGameStore((state) => state.openBookModal);

    return (
        <div className="absolute top-0 left-0 w-full p-5 z-20 flex justify-between items-start text-white pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
                <h1 className="text-2xl tracking-widest font-bold bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    宵の口
                </h1>
                <div className="flex gap-2">
                    <button 
                        onClick={openStageModal}
                        className="bg-black/30 border border-white/30 hover:bg-white/10 px-3 py-1 rounded text-sm transition-colors text-white"
                    >
                        釣り場移動
                    </button>
                    <button 
                        onClick={openBookModal}
                        className="bg-black/30 border border-white/30 hover:bg-white/10 px-3 py-1 rounded text-sm transition-colors text-white"
                    >
                        魚拓帳
                    </button>
                </div>
            </div>
            
            <div className="text-right">
                <div className="text-xs opacity-70">釣果</div>
                <div className="text-2xl font-bold">
                    {score.toFixed(2)}
                </div>
            </div>
        </div>
    );
}
