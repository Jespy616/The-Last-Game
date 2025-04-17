import { Game, GameObjects } from "phaser";
import type { EnemyHealthBar } from "../ui/EnemyHealthBar";

export interface PlayerObject {
    ID: number;
    MaxHealth: number;
    CurrentHealth: number;
    PosX: number;
    PosY: number;
    PrimaryWeapon: WeaponObject;
    SecondaryWeapon: WeaponObject;
    SpriteName: string;
    SpriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
}

export interface EnemyObject {
    ID: number;
    MaxHealth: number;
    CurrentHealth: number;
    PosX: number;
    PosY: number;
    Damage: number;
    Sprite: string;
    SpriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
    Level: 1 | 2 | 3; // 1: low-health, low-damage, 2: low-health, high-damage, 3: high-health, high-damage
    healthBar?: EnemyHealthBar; // Initialized in Phaser
}

export interface WeaponObject {
    ID: number;
    Sprite: string;
    Damage: number;
    Type: 0 | 1 | 2 | 3; // 0: Melee, 1: Ranged, 2: Sweep, 3: AoE
}

export interface RoomObject {
    ID: number;
    Type: 0 | 1 | 2; // 0: Normal, 1: Chest, 2: Stair
    Tiles: string;
    Enemies: EnemyObject[];
    TopID: number | null;
    BottomID: number | null;
    LeftID: number | null;
    RightID: number | null;
    Cleared: boolean;
    Chest: ChestObject | null;
    StairX: number | null;
    StairY: number | null;
}

export interface FloorObject {
    ID: number;
    Rooms: RoomObject[];
    StoryText: string;
}

export interface ChestObject {
    ID: number;
    RoomInID: number;
    Weapon: WeaponObject;
    Opened: boolean;
    PosX: number;
    PosY: number;
    SpriteObject?: Phaser.GameObjects.Sprite; // Initialized in Phaser
}

export interface GameObject {
    ID: number;
    Player: PlayerObject;
    Floor: FloorObject;
    Theme: string;
    Level: number;
}

export interface GameResponse {
    game: GameObject;
}

export interface FloorResponse {
    floor: FloorObject;
}