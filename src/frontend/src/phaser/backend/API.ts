import type { FloorObject, FloorResponse, GameObject, GameResponse } from './types';
const API_URL = 'https://centres-ratios-nominations-compliance.trycloudflare.com/api/protected';

export async function getGame(difficultyLevel: string, Theme: string): Promise<GameObject | null> {
    try {
        console.log(`Making request: ${JSON.stringify({ difficulty: difficultyLevel, theme: Theme })}`)
        const response = await fetch(`${API_URL}/create_game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQwMDU3NzEsImlhdCI6MTc0NDAwNDg3MSwibmJmIjoxNzQ0MDA0ODcxLCJzdWIiOiIxIn0.-yppLS22jIDWdoeHjjeoUyfjuMaetFthwEIz6sQpsEU' },
            body: JSON.stringify({ difficulty: difficultyLevel, theme: Theme })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const gameResponse: GameResponse = await response.json();
        gameResponse.game.Floor.Theme = Theme;
        gameResponse.game.Player.PrimaryWeapon = {
            ID: 0,
            Name: 'Sword',
            Damage: 10,
            Type: 0
        };
        gameResponse.game.Player.SecondaryWeapon = {
            ID: 0,
            Name: 'Sword',
            Damage: 10,
            Type: 0
        };
        return gameResponse.game;
    } catch (error) {
        console.error('Error loading Floor:', error);
    }
    const game: GameResponse = {
        game: {
            ID: 6,
            Level: 1,
            FloorID: 6,
            Floor: {
                ID: 6,
                DeletedAt: null,
                Rooms: [
                    {
                        ID: 36,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [
                            {
                                ID: 55,
                                DeletedAt: null,
                                Damage: 16.5,
                                Level: 2,
                                CurrentHealth: 18.15,
                                MaxHealth: 18.15,
                                RoomID: 36,
                                PosX: 6,
                                PosY: 1,
                                Sprite: 'castle'
                            },
                            {
                                ID: 56,
                                DeletedAt: null,
                                Damage: 16.5,
                                Level: 2,
                                CurrentHealth: 18.15,
                                MaxHealth: 18.15,
                                RoomID: 36,
                                PosX: 1,
                                PosY: 2,
                                Sprite: 'castle'
                            },
                            {
                                ID: 57,
                                DeletedAt: null,
                                Damage: 16.5,
                                Level: 2,
                                CurrentHealth: 18.15,
                                MaxHealth: 18.15,
                                RoomID: 36,
                                PosX: 1,
                                PosY: 2,
                                Sprite: 'castle'
                            }
                        ],
                        ChestID: null,
                        Chest: null,
                        TopID: null,
                        BottomID: 39,
                        LeftID: null,
                        RightID: 42,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.ww.www.ww.ww...........ww.w.........ww...........ww.w...w.....ww...........wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                        X: 3,
                        Y: 1
                    },
                    {
                        ID: 37,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [],
                        ChestID: null,
                        Chest: null,
                        TopID: null,
                        BottomID: null,
                        LeftID: 42,
                        RightID: 41,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.wwwwwwww..ww.w.........ww.wwwwwwww..ww...........ww.wwwwwwww..ww...........wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                        X: 0,
                        Y: 2
                    },
                    {
                        ID: 38,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [
                            {
                                ID: 58,
                                DeletedAt: null,
                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                RoomID: 38,
                                PosX: 5,
                                PosY: 8,
                                Sprite: 'castle'
                            },
                            {
                                ID: 59,
                                DeletedAt: null,
                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                RoomID: 38,
                                PosX: 5,
                                PosY: 7,
                                Sprite: 'castle'
                            },
                            {
                                ID: 60,
                                DeletedAt: null,
                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                RoomID: 38,
                                PosX: 5,
                                PosY: 2,
                                Sprite: 'castle'
                            }
                        ],
                        ChestID: null,
                        Chest: null,
                        TopID: 42,
                        BottomID: null,
                        LeftID: 39,
                        RightID: null,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww....wwww...ww...........ww.wwwwwwww..ww.w......w..ww.w.wwww.w..ww...........wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                        X: 1,
                        Y: 2
                    },
                    {
                        ID: 39,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [
                            {
                                ID: 61,
                                DeletedAt: null,
                                Damage: 11,
                                Level: 1,
                                CurrentHealth: 12.1,
                                MaxHealth: 12.1,
                                RoomID: 39,
                                PosX: 4,
                                PosY: 5,
                                Sprite: 'castle'
                            }
                        ],
                        ChestID: null,
                        Chest: null,
                        TopID: 36,
                        BottomID: null,
                        LeftID: null,
                        RightID: 38,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.wwwwwwwww.ww.........w.ww.w.wwwww.w.ww.w.....w.w.ww.w.wwwww.w.ww.w.......w.wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                        X: 2,
                        Y: 2
                    },
                    {
                        ID: 40,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [
                            {
                                ID: 62,
                                DeletedAt: null,
                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                RoomID: 40,
                                PosX: 3,
                                PosY: 11,
                                Sprite: 'castle'
                            }
                        ],
                        ChestID: null,
                        Chest: null,
                        TopID: null,
                        BottomID: 41,
                        LeftID: null,
                        RightID: null,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.ww........ww...........ww.ww........ww...........ww.ww........ww...........wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                        X: 3,
                        Y: 2
                    },
                    {
                        ID: 41,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [
                            {
                                ID: 63,
                                DeletedAt: null,
                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                RoomID: 41,
                                PosX: 6,
                                PosY: 10,
                                Sprite: 'castle'
                            }
                        ],
                        ChestID: 10,
                        Chest: {
                            ID: 10,
                            DeletedAt: null,
                            RoomInID: null,
                            WeaponID: 41,
                            Weapon: {
                                ID: 41,
                                DeletedAt: null,
                                Damage: 19.36,
                                Sprite: 'bow',
                                Type: 2
                            },
                            PosX: 7,
                            PosY: 3
                        },
                        TopID: 40,
                        BottomID: null,
                        LeftID: 37,
                        RightID: null,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.www.wwww..ww.w.........ww.w.w.www...ww.w.........ww.w.w.www...ww.w.........wwwwwwwwwwwwww',
                        Type: 2,
                        StairX: 1,
                        StairY: 5,
                        X: 0,
                        Y: 3
                    },
                    {
                        ID: 42,
                        DeletedAt: null,
                        FloorID: 6,
                        Floor: null,
                        Enemies: [
                            {
                                ID: 64,
                                DeletedAt: null,
                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                RoomID: 42,
                                PosX: 1,
                                PosY: 5,
                                Sprite: 'castle'
                            }
                        ],
                        ChestID: null,
                        Chest: null,
                        TopID: null,
                        BottomID: 38,
                        LeftID: 36,
                        RightID: 37,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.wwwwwwww..ww.w.........ww.w.wwwwwww.ww...........ww.wwwwwwww..ww...........wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                        X: 1,
                        Y: 3
                    }
                ],
                PlayerInID: 0,
                FloorMap: [[0,0,0,0],[0,0,0,5],[1,7,2,6],[4,3,0,0]],
                StoryText: 'As you exit the castle, you notice a sense of unease in the air. The once bustling courtyard is now empty and silent, with only the sound of distant wind whispers echoing off the stone walls. Youve been tasked with investigating a mysterious energy emanating from a nearby cave, rumored to be the source of the kingdoms recent troubles. With a deep breath, you begin your journey, leaving the castles grandeur behind. The path ahead winds through a dense forest, the trees growing taller and closer together as you venture further away from the castle. The canopy above blocks out most of the sunlight, casting the forest floor in a dim, emerald green hue. As you walk, the trees thin out, and you catch glimpses of a dark opening in the distance - the cave awaits, its entrance a gaping mouth in the side of a hill, beckoning you to explore its depths.',
                Theme: 'castle'
            },
            PlayerSpecifications: 'Cool Game',
            PlayerID: 6,
            Player: {
                ID: 6,
                MaxHealth: 10,
                CurrentHealth: 10,
                PrimaryWeapon: {
                    ID: 0,
                    Name: 'Sword',
                    Damage: 10,
                    Type: 0
                },
                SecondaryWeapon: {
                    ID: 0,
                    Name: 'Sword',
                    Damage: 10,
                    Type: 0
                },
                SpriteName: 'Knight',
                PosX: 6,
                PosY: 4
            },
            UserID: 1
        },
    }
    return game.game;
    return null
}

export async function saveGame(FloorData: Partial<GameObject>): Promise<void> {
    try {
        const response = await fetch('/save_game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(FloorData)
        });

        if (!response.ok) throw new Error('Failed to save game');
        
        console.log('Game saved successfully');
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
        console.error('Error saving game:', error);
    }
}

export async function getFloor(difficultyLevel: string, Theme: string, Level: number): Promise<FloorObject | null> {
    try {
        const response = await fetch(`${API_URL}/create_floor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQwMDU3NzEsImlhdCI6MTc0NDAwNDg3MSwibmJmIjoxNzQ0MDA0ODcxLCJzdWIiOiIxIn0.-yppLS22jIDWdoeHjjeoUyfjuMaetFthwEIz6sQpsEU' },
            body: JSON.stringify({ difficulty: difficultyLevel, theme: Theme, level: Level })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const floorResponse: FloorResponse = await response.json();
        return floorResponse.floor;
    } catch (error) {
        console.error('Error loading Floor: ', error);
        return null;
    }
}