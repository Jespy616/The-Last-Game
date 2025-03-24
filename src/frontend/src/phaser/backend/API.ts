import type { GameObject } from "./types";
import type { StoryResponse } from "./types";

export async function getGame(difficultyLevel: number, theme: string): Promise<GameObject | null> {
    // try {
    //     const response = await fetch('/api/GetGame', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ difficultyLevel, theme })
    //     });

    //     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    //     const gameData: GameObject = await response.json();
    //     return gameData;
    // } catch (error) {
    //     console.error('Error loading floor:', error);
    //     return null;
    // }

    const game: GameObject = { // COMMENT OUT FOR BACKEND INTEGRATION
        player: {
            id: 1,
            maxHealth: 100,
            currentHealth: 100,
            posX: 4,
            posY: 4,
            spriteName: 'Knight',
            primaryWeapon: {
                id: 1,
                name: 'Sword',
                damage: 10,
                type: 0
            },
            secondaryWeapon: {
                id: 2,
                name: 'Bow',
                damage: 5,
                type: 1
            }
        },
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
                        enemies: [
                            {
                                id: 1,
                                maxHealth: 10,
                                currentHealth: 10,
                                posX: 12,
                                posY: 3,
                                damage: 5,
                                spriteName: 'Mushroom',
                                level: 1
                            },
                            {
                                id: 2,
                                maxHealth: 15,
                                currentHealth: 15,
                                posX: 2,
                                posY: 2,
                                damage: 15,
                                spriteName: 'Mushroom',
                                level: 2
                            },
                            {
                                id: 3,
                                maxHealth: 20,
                                currentHealth: 20,
                                posX: 7,
                                posY: 7,
                                damage: 20,
                                spriteName: 'Mushroom',
                                level: 3
                            }
                        ]
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
                        top: 3,
                        enemies: [
                            {
                                id: 1,
                                maxHealth: 10,
                                currentHealth: 10,
                                posX: 12,
                                posY: 3,
                                damage: 5,
                                spriteName: 'Mushroom',
                                level: 1
                            },
                            {
                                id: 2,
                                maxHealth: 15,
                                currentHealth: 15,
                                posX: 2,
                                posY: 2,
                                damage: 15,
                                spriteName: 'Mushroom',
                                level: 2
                            },
                            {
                                id: 3,
                                maxHealth: 20,
                                currentHealth: 20,
                                posX: 7,
                                posY: 7,
                                damage: 20,
                                spriteName: 'Mushroom',
                                level: 3
                            }
                        ]
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
                        bottom: 2,
                        enemies: [
                            {
                                id: 1,
                                maxHealth: 10,
                                currentHealth: 10,
                                posX: 12,
                                posY: 3,
                                damage: 5,
                                spriteName: 'Mushroom',
                                level: 1
                            },
                            {
                                id: 2,
                                maxHealth: 15,
                                currentHealth: 15,
                                posX: 2,
                                posY: 2,
                                damage: 15,
                                spriteName: 'Mushroom',
                                level: 2
                            },
                            {
                                id: 3,
                                maxHealth: 20,
                                currentHealth: 20,
                                posX: 7,
                                posY: 7,
                                damage: 20,
                                spriteName: 'Mushroom',
                                level: 3
                            }
                        ]
                    }
                ],
            ]
        }
    };
    return game;
}

export async function saveGame(floorData: Partial<GameObject>): Promise<void> {
    try {
        const response = await fetch('/api/Save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(floorData)
        });

        if (!response.ok) throw new Error('Failed to save game');
        
        console.log('Game saved successfully');
    } catch (error) {
        console.error('Error saving game:', error);
    }
}

export async function fetchStoryText(): Promise<string> {
    try {
        const response = await fetch('/api/GetText');
        if (!response.ok) throw new Error('Failed to fetch story');
        
        const story: StoryResponse = await response.json();
        return story.text;
    } catch (error) {
        console.error('Error fetching story:', error);
        return 'Story unavailable...';
    }
}