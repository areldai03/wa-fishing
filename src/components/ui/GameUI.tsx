'use client';

import Header from './Header';
import StageSelector from './StageSelector';
import ResultModal from './ResultModal';
import BookModal from './BookModal';
import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameUI() {
    const isTitleVisible = useGameStore((state) => state.isTitleVisible);
    
    if (isTitleVisible) return null;

    return (
        <>
            <Header />
            <StageSelector />
            <ResultModal />
            <BookModal />
            
            {/* Hint Overlay - assuming we might want to move it to React later or just keep naive impl */}
            <div className="absolute bottom-10 w-full text-center pointer-events-none z-10">
                <div className="inline-block bg-black/40 backdrop-blur-sm text-white px-6 py-2 rounded-full font-bold text-shadow shadow-lg">
                    {/* We need to subscribe to game hint or just let canvas draw it? 
                        The original drew it in DOM. Let's add a simple subscriber component for hint later.
                        For now, placeholder.
                     */}
                    <HintDisplay /> 
                </div>
            </div>
        </>
    );
}

// Separate component to subscribe to high-frequency hint updates?
// Or just expose a way to set hint ref
function HintDisplay() {
    const hint = useGameStore((state) => state.hint);

    return (
        <AnimatePresence mode="wait">
            <motion.span 
                key={hint}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                id="hint-target"
                className="block"
            >
                {hint}
            </motion.span>
        </AnimatePresence>
    );
}
