import type { GameObject } from "../backend/types";

export async function GameFactory(difficultyLevel: number, theme: string): Promise<GameObject | null> {
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
    const game: GameObject = {
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
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
                        ]
                    },
                    {
                        id: 2,
                        type: 0,
                        tiles: [
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
                            ['w', '.', 'w', '.', '.', '.', '.', 'w', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', 'w', 'w', '.', '.', 'w', 'w', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'w', '.', '.', 'w'],
                            ['w', '.', '.', 'w', '.', '.', '.', '.', '.', '.', '.', 'w', '.', '.', '.'],
                            ['w', '.', 'w', 'w', 'w', '.', '.', '.', '.', '.', 'w', 'w', 'w', '.', 'w'],
                            ['w', '.', '.', 'w', '.', '.', 'w', 'w', '.', '.', 'w', '.', 'w', '.', 'w'],
                            ['w', '.', '.', '.', '.', '.', '.', 'w', '.', '.', '.', '.', '.', '.', 'w'],
                            ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w']
                        ]
                    }
                ],
            ]
        }
    };
    return game;
}