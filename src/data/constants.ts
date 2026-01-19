import { FishType, StageData, GameConfig } from './types';

export const FISH_TYPES: FishType[] = [
    { id: 'funa', name: '鮒', nameEn: 'Funa', rarity: 1, minSize: 15, maxSize: 30, color: '#e0cda8', speed: 1.0, power: 0.5, desc: '親しみやすい魚。' },
    { id: 'suzuki', name: '鱸', nameEn: 'Sea Bass', rarity: 2, minSize: 40, maxSize: 80, color: '#a0aab5', speed: 1.5, power: 1.2, desc: 'エラ洗いが得意な海のハンター。' },
    { id: 'madai', name: '真鯛', nameEn: 'Red Sea Bream', rarity: 3, minSize: 30, maxSize: 70, color: '#ff9999', speed: 1.2, power: 1.0, desc: 'おめでたい魚の代名詞。美しい桜色。' },
    { id: 'kurodai', name: '黒鯛', nameEn: 'Black Sea Bream', rarity: 2, minSize: 30, maxSize: 50, color: '#555555', speed: 1.1, power: 0.9, desc: '警戒心が強く、釣りごたえがある。' },
    
    { id: 'iwana', name: '岩魚', nameEn: 'Iwana', rarity: 3, minSize: 20, maxSize: 50, color: '#5d5648', speed: 1.8, power: 0.9, desc: '渓流の王者。岩陰に潜む。' },
    { id: 'yamame', name: '山女魚', nameEn: 'Yamame', rarity: 3, minSize: 20, maxSize: 40, color: '#8c9ea3', speed: 2.0, power: 0.8, desc: '美しいパーマークを持つ渓流の女王。' },
    { id: 'ayu', name: '鮎', nameEn: 'Ayu', rarity: 2, minSize: 15, maxSize: 25, color: '#a8c66c', speed: 2.2, power: 0.5, desc: '石についた苔を食む香魚。' },
    
    { id: 'koi', name: '鯉', nameEn: 'Koi', rarity: 2, minSize: 40, maxSize: 90, color: '#333333', speed: 1.0, power: 1.5, desc: '池の主のような貫禄を持つ。' },
    { id: 'namazu', name: '鯰', nameEn: 'Catfish', rarity: 2, minSize: 40, maxSize: 70, color: '#4a4036', speed: 0.8, power: 1.2, desc: '大きな口と髭が特徴。' },
    { id: 'nishiki', name: '錦鯉', nameEn: 'Nishikigoi', rarity: 3, minSize: 40, maxSize: 80, color: 'pattern', speed: 0.8, power: 0.8, desc: '泳ぐ宝石。' },
    { id: 'ryu', name: '龍魚', nameEn: 'Dragon Fish', rarity: 5, minSize: 100, maxSize: 150, color: 'gold', speed: 2.5, power: 3.0, desc: '伝説の魚。' },
    
    { id: 'kingyo', name: '金魚', nameEn: 'Goldfish', rarity: 1, minSize: 5, maxSize: 10, color: '#ff4400', speed: 0.6, power: 0.1, desc: '小さくて可愛い。' },
    { id: 'demekin', name: '出目金', nameEn: 'Telescope Eye', rarity: 2, minSize: 5, maxSize: 10, color: '#111111', speed: 0.5, power: 0.1, desc: '飛び出た目が特徴的な黒い金魚。' }
];

export const STAGES: Record<string, StageData> = {
    river_mouth: {
        id: 'river_mouth',
        name: "河口",
        bgGradient: ['#1a1f3c', '#5a6b9c', '#2c3e50', '#0a1520'],
        waterColor: '#2c3e50',
        flow: 0.5,
        fishCount: 8,
        fishTypes: ['suzuki', 'madai', 'kurodai', 'funa']
    },
    stream: {
        id: 'stream',
        name: "渓流",
        bgGradient: ['#1e2e26', '#4a6b5d', '#354f46', '#0f1a16'],
        waterColor: '#354f46',
        flow: 2.5,
        fishCount: 8,
        fishTypes: ['iwana', 'yamame', 'ayu'],
        waterY: 0.45 
    },
    pond: {
        id: 'pond',
        name: "古池",
        bgGradient: ['#0f1520', '#2a3d4f', '#1c2b36', '#080d12'],
        waterColor: '#1c2b36',
        flow: 0,
        fishCount: 10,
        fishTypes: ['koi', 'funa', 'namazu', 'nishiki', 'ryu']
    },
    festival: {
        id: 'festival',
        name: "縁日",
        bgGradient: ['#3e1e1e', '#8c4b4b', '#5e2a2a', '#2a1111'],
        waterColor: '#5e2a2a',
        flow: 0.1,
        fishCount: 25,
        fishTypes: ['kingyo', 'demekin', 'nishiki']
    }
};

export const CONFIG: GameConfig = {
    gravity: 0.4,
    friction: 0.95,
    tensionLimit: 100,
    tensionRecovery: 0.8,
    tensionIncrease: 1.3
};
