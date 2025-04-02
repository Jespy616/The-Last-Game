import type { EnemyHealthBar } from "../ui/EnemyHealthBar";

export interface PlayerObject {
    id: number;
    MaxHealth: number;
    CurrentHealth: number;
    PosX: number;
    PosY: number;
    PrimaryWeapon: ItemObject;
    SecondaryWeapon: ItemObject;
    SpriteName: string;
    SpriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
}

export interface EnemyObject {
    id: number;
    MaxHealth: number;
    CurrentHealth: number;
    PosX: number;
    PosY: number;
    Damage: number;
    SpriteName: string;
    SpriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
    Level: 1 | 2 | 3; // 1: low-health, low-damage, 2: low-health, high-damage, 3: high-health, high-damage
    healthBar?: EnemyHealthBar; // Initialized in Phaser
}

export interface ItemObject {
    id: number;
    Name: string;
    Damage: number;
    Type: 0 | 1 | 2 | 3; // 0: Melee, 1: Ranged, 2: Sweep, 3: AoE
}

export interface RoomObject {
    id: number;
    Type: 0 | 1 | 2; // 0: Normal, 1: Chest, 2: Stair
    Tiles: string;
    Enemies: EnemyObject[];
    Top?: number;
    Bottom?: number;
    Left?: number;
    Right?: number;
}

export interface FloorObject {
    Theme: string;
    Level: number;
    Rooms: RoomObject[][];
}

export interface GameObject {
    Player: PlayerObject;
    Floor: FloorObject;
}

export interface StoryResponse {
    Text: string;
}