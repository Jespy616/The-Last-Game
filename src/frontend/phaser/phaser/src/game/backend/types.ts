import Sprite from "phaser";

export interface Player {
    id: number;
    health: number;
    currentHealth: number;
    posX: number;
    posY: number;
    primaryWeapon: Item;
    secondaryWeapon: Item;
}

export interface EnemyObject {
    id: number;
    health: number;
    posX: number;
    posY: number;
    weapon: Item;
}

export interface Item {
    id: number;
    name: string;
    damage: number;
    type: 0 | 1 | 2 | 3; // 0: Melee, 1: Ranged, 2: Sweep, 3: AoE
}

export interface RoomObject {
    id: number;
    type: 0 | 1 | 2; // 0: Normal, 1: Chest, 2: Stair
    tiles: string[][];
    // enemies: EnemyObject[];
}

export interface FloorObject {
    theme: string;
    level: number;
    rooms: RoomObject[][];
}

export interface GameObject {
    // player: Player;
    floor: FloorObject;
}

export interface StoryResponse {
    text: string;
}