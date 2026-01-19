'use client';

import { useGameStore } from '@/lib/store';
import { FISH_TYPES } from '@/data/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookModal() {
    const isOpen = useGameStore((state) => state.isBookModalOpen);
    const close = useGameStore((state) => state.closeBookModal);
    const caughtHistory = useGameStore((state) => state.caughtHistory);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center z-50 backdrop-blur-sm p-4"
                >
                    <div className="bg-brand-cream text-gray-800 p-8 rounded shadow-[0_0_30px_rgba(176,148,255,0.2)] max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-300">
                        <h3 className="text-xl mb-6 font-bold text-center border-b border-brand-red pb-2 mx-auto inline-block">魚拓帳</h3>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto pr-2 mb-6 flex-1">
                            {FISH_TYPES.map((fish) => {
                                const isCaught = caughtHistory.has(fish.id);
                                return (
                                    <div 
                                        key={fish.id}
                                        className={`
                                            aspect-square flex flex-col justify-center items-center p-2 rounded border text-center
                                            ${isCaught ? 'bg-red-50/50 border-brand-red/30 opacity-100' : 'bg-gray-100 border-gray-200 opacity-50 grayscale'}
                                        `}
                                    >
                                        <div className="font-bold text-sm mb-1">
                                            {isCaught ? fish.name : '???'}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mb-1">
                                            {fish.nameEn}
                                        </div>
                                        {isCaught && (
                                            <div className="text-xs text-brand-red">
                                                {'★'.repeat(fish.rarity)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <button 
                            onClick={close}
                            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors self-center"
                        >
                            戻る
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
