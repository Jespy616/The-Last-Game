import type { HealthBar } from "../ui/HealthBar";

export interface PlayerObject {
    id: number;
    maxHealth: number;
    currentHealth: number;
    posX: number;
    posY: number;
    primaryWeapon: ItemObject;
    secondaryWeapon: ItemObject;
    healthBar?: HealthBar; // Initialized in Phaser
    spriteName: string;
    spriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
}

export interface EnemyObject {
    id: number;
    maxHealth: number;
    currentHealth: number;
    posX: number;
    posY: number;
    damage: number;
    spriteName: string;
    spriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
    level: 1 | 2 | 3; // 1: low-health, low-damage, 2: low-health, high-damage, 3: high-health, high-damage
    healthBar?: HealthBar; // Initialized in Phaser
}

export interface ItemObject {
    id: number;
    name: string;
    damage: number;
    type: 0 | 1 | 2 | 3; // 0: Melee, 1: Ranged, 2: Sweep, 3: AoE
}

export interface RoomObject {
    id: number;
    type: 0 | 1 | 2; // 0: Normal, 1: Chest, 2: Stair
    tiles: string[][];
    enemies: EnemyObject[];
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export interface FloorObject {
    theme: string;
    level: number;
    rooms: RoomObject[][];
}

export interface GameObject {
    player: PlayerObject;
    floor: FloorObject;
}

export interface StoryResponse {
    text: string;
}