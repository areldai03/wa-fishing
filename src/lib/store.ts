import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FishType } from '@/data/types';

interface GameState {
    score: number;
    caughtHistory: Set<string>;
    currentStageId: string;
    isStageModalOpen: boolean;
    resultFish: { type: FishType; size: number } | null;
    isResultModalOpen: boolean;
    isBookModalOpen: boolean;
    isTitleVisible: boolean;
    hint: string;
    
    // Actions
    setScore: (score: number) => void;
    addScore: (amount: number) => void;
    addCaughtFish: (fishId: string) => void;
    setStage: (stageId: string) => void;
    openStageModal: () => void;
    closeStageModal: () => void;
    openResultModal: (fish: { type: FishType; size: number }) => void;
    closeResultModal: () => void;
    openBookModal: () => void;
    closeBookModal: () => void;
    setTitleVisible: (visible: boolean) => void;
    setHint: (text: string) => void;
}

// Remove custom storage and use standard implementation with merge/partialize handling
export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            score: 0,
            caughtHistory: new Set(),
            currentStageId: 'river_mouth',
            isStageModalOpen: false, // Start closed for Title Screen
            resultFish: null,
            isResultModalOpen: false,
            isBookModalOpen: false,
            isTitleVisible: true,
            hint: '', // Empty hint on title

            setScore: (score) => set({ score }),
            addScore: (amount) => set((state) => ({ score: state.score + amount })),
            addCaughtFish: (fishId) => set((state) => {
                const currentHistory = state.caughtHistory instanceof Set 
                    ? state.caughtHistory 
                    : new Set((state.caughtHistory as unknown as string[]) || []);
                const newHistory = new Set<string>(currentHistory);
                newHistory.add(fishId);
                return { caughtHistory: newHistory };
            }),
            setStage: (stageId) => set({ currentStageId: stageId }),
            openStageModal: () => set({ isStageModalOpen: true }),
            closeStageModal: () => set({ isStageModalOpen: false }),
            openResultModal: (fish) => set({ resultFish: fish, isResultModalOpen: true }),
            closeResultModal: () => set({ isResultModalOpen: false, resultFish: null }),
            openBookModal: () => set({ isBookModalOpen: true }),
            closeBookModal: () => set({ isBookModalOpen: false }),
            setTitleVisible: (visible) => set({ isTitleVisible: visible }),
            setHint: (hint) => set({ hint }),
        }),
        {
            name: 'wafishing-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                score: state.score, 
                // Casting to satisfy partial GameState, though effectively it's storing string[]
                caughtHistory: Array.from(state.caughtHistory) as unknown as Set<string>,
                currentStageId: state.currentStageId
            }),
            merge: (persistedState: unknown, currentState) => {
                const p = persistedState as Partial<GameState> & { caughtHistory?: string[] };
                return {
                    ...currentState,
                    ...p,
                    caughtHistory: new Set(p.caughtHistory || []),
                };
            },
        }
    )
);
