export interface FishType {
    id: string;
    name: string;
    nameEn: string;
    rarity: number;
    minSize: number;
    maxSize: number;
    color: string;
    speed: number;
    power: number;
    desc: string;
}

export interface StageData {
    id: string;
    name: string;
    bgGradient: string[];
    waterColor: string;
    flow: number;
    fishCount: number;
    fishTypes: string[];
}

export interface GameConfig {
    gravity: number;
    friction: number;
    tensionLimit: number;
    tensionRecovery: number;
    tensionIncrease: number;
}

export interface Bobber {
    x: number;
    y: number;
    vx: number;
    vy: number;
    submerged: boolean;
}

export enum GameState {
    IDLE = 0,
    CASTING = 1,
    WAITING = 2,
    BITING = 3,
    HOOKED = 4,
    CAUGHT = 5,
    BROKEN = 6,
    MENU = 99
}
