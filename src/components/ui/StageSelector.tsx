'use client';

import { useGameStore } from '@/lib/store';
import { STAGES } from '@/data/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function StageSelector() {
    const isOpen = useGameStore((state) => state.isStageModalOpen);
    const close = useGameStore((state) => state.closeStageModal);
    const setStage = useGameStore((state) => state.setStage);

    const handleSelect = (stageId: string) => {
        setStage(stageId);
        close();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center z-50 backdrop-blur-sm p-4"
                >
                    <div className="bg-brand-cream text-gray-800 p-8 rounded shadow-[0_0_30px_rgba(176,148,255,0.2)] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300">
                        <h3 className="text-xl mb-4 font-bold text-center border-b border-brand-red pb-2 inline-block mx-auto">釣り場を選択</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {Object.entries(STAGES).map(([key, stage]) => (
                                <button
                                    key={key}
                                    onClick={() => handleSelect(key)}
                                    className={`
                                        p-4 rounded border text-left transition-all hover:-translate-y-1 hover:shadow-lg
                                        ${key === 'festival' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
                                    `}
                                >
                                    <div className="font-bold text-lg mb-2 text-gray-800 border-b-2 border-brand-red inline-block">
                                        {stage.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {key === 'stream' && "流れが速い渓流。\nルアー操作が必要。"}
                                        {key === 'pond' && "静まり返った古池。\n主が潜む。"}
                                        {key === 'river_mouth' && "穏やかな河口。\n様々な魚が集まる。"}
                                        {key === 'festival' && "賑やかな縁日。\n金魚すくい。"}
                                    </div>
                                    <div className="text-xs text-gray-400 italic">
                                        主な魚: {stage.fishTypes.slice(0,3).join(', ')}...
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
