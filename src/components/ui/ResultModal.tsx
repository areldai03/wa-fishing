'use client';

import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultModal() {
    const isOpen = useGameStore((state) => state.isResultModalOpen);
    const resultFish = useGameStore((state) => state.resultFish);
    const close = useGameStore((state) => state.closeResultModal);

    if (!resultFish) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center z-40 backdrop-blur-sm p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-brand-cream text-gray-800 p-8 rounded shadow-2xl max-w-sm w-full text-center border border-gray-300"
                    >
                        <h3 className="text-gray-500 mb-2 text-sm uppercase tracking-widest">釣果</h3>
                        <div className="text-4xl font-bold text-brand-red mb-2 my-4">
                            {resultFish.type.name}
                        </div>
                        <div className="text-xl font-mono mb-4">
                            {resultFish.size} cm
                        </div>
                        <div className="text-gray-600 mb-6 text-sm leading-relaxed">
                            {resultFish.type.desc}
                        </div>
                        <button 
                            onClick={close}
                            className="bg-gray-800 text-white px-8 py-3 rounded hover:bg-brand-red transition-colors w-full"
                        >
                            閉じる
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
