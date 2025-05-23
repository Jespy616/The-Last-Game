import type { FloorObject, FloorResponse, GameObject, GamePreview, GameResponse, GamesResponse } from './types';
import { authStore } from '../../lib/stores/authStore';
const API_URL = 'http://127.0.0.1:8080/api/protected';

export async function createGame(difficultyLevel: string, Theme: string): Promise<GameObject | null> {
    try {
        let token;
        authStore.subscribe((value) => {
            token = value.token;
        })();
        const response = await fetch(`${API_URL}/create_game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` },
            body: JSON.stringify({ difficulty: difficultyLevel, theme: Theme })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const gameResponse: GameResponse = await response.json();
        return gameResponse.game;
    } catch (error) {
        console.error('Error loading Floor:', error);
    }
    const game: GameResponse = {
        game: {
            Level: 1,
            ID: 6,
            Floor: {
                Theme: 'castle',
                ID: 6,
                Rooms: [
                    {
                        ID: 36,
                        Enemies: [
                            {
                                ID: 55,
                                Damage: 16.5,
                                Level: 2,
                                CurrentHealth: 18.15,
                                MaxHealth: 18.15,
                                PosX: 6,
                                PosY: 1,
                                Sprite: 'castle'
                            },
                            {
                                ID: 56,
                                Damage: 16.5,
                                Level: 2,
                                CurrentHealth: 18.15,
                                MaxHealth: 18.15,
                                PosX: 1,
                                PosY: 2,
                                Sprite: 'castle'
                            },
                            {
                                ID: 57,
                                Damage: 16.5,
                                Level: 2,
                                CurrentHealth: 18.15,
                                MaxHealth: 18.15,
                                PosX: 1,
                                PosY: 2,
                                Sprite: 'castle'
                            }
                        ],
                        Chest: null,
                        TopID: null,
                        BottomID: 39,
                        LeftID: 41,
                        RightID: 42,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.ww.www.ww.ww...........ww.w.........ww...........ww.w...w.....ww...........wwwwwwwwwwwwww',
                        Type: 0,
                        StairX: null,
                        StairY: null,
                    },
                    {
                        ID: 37,
                        Enemies: [],
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
                    },
                    {
                        ID: 38,
                        Enemies: [
                            {
                                ID: 58,

                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                PosX: 5,
                                PosY: 8,
                                Sprite: 'castle'
                            },
                            {
                                ID: 59,

                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                PosX: 5,
                                PosY: 7,
                                Sprite: 'castle'
                            },
                            {
                                ID: 60,

                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                PosX: 5,
                                PosY: 2,
                                Sprite: 'castle'
                            }
                        ],
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
                    },
                    {
                        ID: 39,

                        Enemies: [
                            {
                                ID: 61,

                                Damage: 11,
                                Level: 1,
                                CurrentHealth: 12.1,
                                MaxHealth: 12.1,
                                PosX: 4,
                                PosY: 5,
                                Sprite: 'castle'
                            }
                        ],
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
                    },
                    {
                        ID: 40,
                        Enemies: [
                            {
                                ID: 62,

                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                PosX: 3,
                                PosY: 11,
                                Sprite: 'castle'
                            }
                        ],
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
                    },
                    {
                        ID: 41,
                        Enemies: [],
                        Chest: {
                            ID: 10,
                            RoomInID: 41,
                            Weapon: {
                                ID: 41,
                                Sprite: 'bow',
                                Damage: 19.36,
                                Type: 2
                            },
                            PosX: 7,
                            PosY: 3,
                            Opened: false
                        },
                        TopID: 40,
                        BottomID: null,
                        LeftID: 37,
                        RightID: 36,
                        Cleared: false,
                        Tiles: 'wwwwwwwwwwwwww...........ww.www.wwww..ww.w.........ww.w.w.www...ww.w.........ww.w.w.www...ww.w.........wwwwwwwwwwwwww',
                        Type: 2,
                        StairX: 1,
                        StairY: 5,
                    },
                    {
                        ID: 42,
                        Enemies: [
                            {
                                ID: 64,

                                Damage: 22,
                                Level: 3,
                                CurrentHealth: 24.2,
                                MaxHealth: 24.2,
                                PosX: 1,
                                PosY: 5,
                                Sprite: 'castle'
                            }
                        ],
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
                    }
                ],
                StoryText: 'As you exit the castle, you notice a sense of unease in the air. The once bustling courtyard is now empty and silent, with only the sound of distant wind whispers echoing off the stone walls. Youve been tasked with investigating a mysterious energy emanating from a nearby cave, rumored to be the source of the kingdoms recent troubles. With a deep breath, you begin your journey, leaving the castles grandeur behind. The path ahead winds through a dense forest, the trees growing taller and closer together as you venture further away from the castle. The canopy above blocks out most of the sunlight, casting the forest floor in a dim, emerald green hue. As you walk, the trees thin out, and you catch glimpses of a dark opening in the distance - the cave awaits, its entrance a gaping mouth in the side of a hill, beckoning you to explore its depths.',
            },
            Player: {
                ID: 6,
                MaxHealth: 100,
                CurrentHealth: 100,
                PrimaryWeapon: {
                    ID: 0,
                    Sprite: 'Sword',
                    Damage: 10,
                    Type: 0
                },
                SpriteName: 'Knight',
                PosX: 6,
                PosY: 4
            },
        },
    }
    return game.game;
}

interface SaveRoom {
    ID: number;
    BottomID: number | null;
    TopID: number | null;
    LeftID: number | null;
    RightID: number | null;
    StairX: number | null;
    StairY: number | null;
    Tiles: string;
    Type: number;
    X: number;
    Y: number;
    EnemyIDs: number[];
    ChestID?: number;
  }

  interface SaveFloor {
    ID: number;
    Rooms: SaveRoom[];
    Theme: string;
    StoryText: string;
  }

  interface SaveGame {
    ID: number;
    Level: number;
    Floor: SaveFloor;
    PlayerID: number;
  }

  function toSaveable(g: GameObject): SaveGame {
    return {
      ID: g.ID,
      Level: g.Level,
      PlayerID: g.Player.ID,
      Floor: {
        ID: g.Floor.ID,
        Theme: g.Floor.Theme,
        StoryText: g.Floor.StoryText,
        Rooms: g.Floor.Rooms.map(r => ({
          ID: r.ID,
          BottomID: r.BottomID,
          TopID: r.TopID,
          LeftID: r.LeftID,
          RightID: r.RightID,
          StairX: r.StairX,
          StairY: r.StairY,
          Tiles: r.Tiles,
          Type: r.Type,
          X: r.StairX ?? 0, // Provide a default value if StairX is null
          Y: r.StairY ?? 0, // Provide a default value if StairY is null
          EnemyIDs: r.Enemies.map(e => e.ID),
          ChestID: r.Chest?.ID,
          Chest: {
            ID: r.Chest?.ID,
            PosX: r.Chest?.PosX,
            PosY: r.Chest?.PosY,
            RoomInID: r.Chest?.RoomInID,
            WeaponID: r.Chest?.Weapon.ID,
            Weapon: {
                Damage: r.Chest?.Weapon.Damage,
                ID: r.Chest?.Weapon.ID,
                Sprite: r.Chest?.Weapon.Sprite,
                Type: r.Chest?.Weapon.Type,
            }
          }
        })),
      },
    };
  }


export async function saveGame(Game: GameObject): Promise<void> {
    try {

        let token;
        authStore.subscribe((value) => {
            token = value.token;
        })();
        const response = await fetch(`${API_URL}/save_game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` },
            body: JSON.stringify({ game: toSaveable(Game) }),
        });

        if (!response.ok) throw new Error('Failed to save game');

        console.log('Game saved successfully');
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
        console.error('Error saving game:', error);
    }
}

export async function getFloor(difficulty: string, theme: string, level: number, lastStory: string, lastTheme: string): Promise<FloorObject | null> {
    try {
        let token;
        authStore.subscribe((value) => {
            token = value.token;
        })();
        console.log(`Making request: ${JSON.stringify({ difficulty: difficulty, theme: theme, level: level })}`)
        const response = await fetch(`${API_URL}/create_floor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` },
            body: JSON.stringify({ difficulty: difficulty, theme: theme, level: level, lastStory: lastStory, lastTheme: lastTheme, })
        });
        console.log("Here is the response, ", response)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const floorResponse: FloorResponse = await response.json();
        return floorResponse.floor;
    } catch (error) {
        console.error('Error loading Floor: ', error);
    }
    return {
        ID: 2,
        Theme: "desert",
        Rooms: [
            {
                ID: 101,
                Enemies: [
                    {
                        ID: 201,
                        Damage: 15,
                        Level: 2,
                        CurrentHealth: 30,
                        MaxHealth: 30,
                        PosX: 2,
                        PosY: 3,
                        Sprite: 'forest'
                    }
                ],
                Chest: {
                    ID: 301,
                    RoomInID: 101,
                    Weapon: {
                        ID: 401,
                        Sprite: 'Axe',
                        Damage: 20,
                        Type: 1
                    },
                    PosX: 4,
                    PosY: 5,
                    Opened: false
                },
                TopID: null,
                BottomID: 102,
                LeftID: null,
                RightID: null,
                Cleared: false,
                Tiles: 'wwwwwwwwwwwwww...........ww.wwwwwwww..ww...........ww.w.........ww...........ww.w.........ww...........wwwwwwwwwwwwww',
                Type: 0,
                StairX: null,
                StairY: null,
            }
        ],
        StoryText: 'You find yourself in a dense forest, the air thick with the scent of pine and damp earth. The path ahead is unclear, but you sense danger lurking in the shadows.'
    };
}

export async function getGames(): Promise<GamePreview[] | null> {
    try {
        let token;
        authStore.subscribe((value) => {
            token = value.token;
        })();
        const response = await fetch(`${API_URL}/get_games`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        console.log(response)
        const gamesResponse: GamesResponse = await response.json();
        const gamePreviews: GamePreview[] = [];
        for (let i = 0; i < gamesResponse.GameIDs.length; i++) {
            gamePreviews.push({
                ID: gamesResponse.GameIDs[i],
                Level: gamesResponse.Levels[i]
            });
        }
        console.log(gamePreviews)
        return gamePreviews;
    } catch (error) {
        console.error('Error loading games:', error);
    }
    return null;
}

export async function getGame(gameID: number): Promise<GameObject | null> {
    try {
        let token;
        authStore.subscribe((value) => {
            token = value.token;
        })();
        const response = await fetch(`${API_URL}/game/${gameID}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization':`Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const gameResponse: GameObject = await response.json();
        return gameResponse;
        
    } catch (error) {
        console.error('Error loading game:', error);
    }
    return null;
}
