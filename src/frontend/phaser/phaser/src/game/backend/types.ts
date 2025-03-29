export interface PlayerObject {
    id: number;
    health: number;
    currentHealth: number;
    posX: number;
    posY: number;
    primaryWeapon: ItemObject;
    secondaryWeapon: ItemObject;
}

export interface EnemyObject {
    id: number;
    health: number;
    posX: number;
    posY: number;
    weapon: ItemObject;
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
    // enemies: EnemyObject[];
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
    // player: PlayerObject;
    floor: FloorObject;
}

export interface StoryResponse {
    text: string;
}