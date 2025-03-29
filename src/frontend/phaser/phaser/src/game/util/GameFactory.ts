import type { GameObject } from "../backend/types";

export async function GameFactory(difficultyLevel: number, theme: string): Promise<GameObject | null> {
    // UNCOMMENT FOR BACKEND INTEGRATION
    //
    // try {
    //     const response = await fetch('/api/GetGame', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ difficultyLevel, theme })
    //     });

    //     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    //     const gameData: GameObject = await response.json();

    //     for (let roomRow of gameData.floor.rooms) {
    //         for (let room of roomRow) {
    //             generateTilemap(room.tiles, theme, room.id);
    //         }
    //     }
    //     return gameData;
    // } catch (error) {
    //     console.error('Error loading game:', error);
    //     return null;
    // }

    
    const game: GameObject = { // COMMENT OUT FOR BACKEND INTEGRATION
        floor: {
            theme: theme,
            level: 1,
            rooms: [
                [
                    {
                        id: 1,
                        type: 0,
                        tiles: [
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', 'w', 'w', '.', '.', 'w', 'w', '.', '.', '.', '.', 'w'],
                            ['.', '.', '.', '.', 'w', '.', '.', '.', '.', 'w', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', 'w', '.', '.', '.', '.', 'w', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', 'w', 'w', 'w', 'w', 'w', 'w', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
                        ],
                        left: 2,
                    },
                    {
                        id: 2,
                        type: 0,
                        tiles: [
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', '.', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
                            ['w', '.', 'w', '.', '.', '.', 'w', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', 'w', 'w', '.', '.', 'w', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w', '.', '.', 'w'],
                            ['w', '.', '.', 'w', '.', '.', '.', '.', '.', '.', '.', 'w', '.', '.', '.'],
                            ['w', '.', 'w', 'w', 'w', '.', '.', '.', '.', '.', 'w', 'w', 'w', '.', 'w'],
                            ['w', '.', '.', 'w', '.', '.', 'w', 'w', '.', '.', 'w', '.', 'w', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', 'w', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
                        ],
                        right: 1,
                        top: 3
                    },
                    {
                        id: 3,
                        type: 0,
                        tiles: [
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
                            ['w', '.', 'w', '.', '.', '.', '.', 'w', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', 'w', 'w', '.', '.', 'w', 'w', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w', '.', '.', 'w'],
                            ['w', '.', 'w', 'w', '.', '.', '.', '.', '.', '.', '.', 'w', 'w', '.', 'w'],
                            ['w', '.', 'w', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', 'w', 'w', 'w', '.', '.', '.', 'w', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', '.', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
                        ],
                        bottom: 2
                    }
                ],
            ]
        }
    };
    return game;
}