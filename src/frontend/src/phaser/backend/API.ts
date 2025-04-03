import type { GameObject } from "./types";
import type { StoryResponse } from "./types";
const API_URL = 'http://localhost:8080/api';

export async function getGame(difficultyLevel: number, Theme: string): Promise<GameObject | null> {
    try {
        const response = await fetch(`${API_URL}/GetGame`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ difficultyLevel, Theme })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const gameData: GameObject = await response.json();
        return gameData;
    } catch (error) {
        console.error('Error loading Floor:', error);
    }
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate delay
    const game: GameObject = { // COMMENT OUT FOR BACKEND INTEGRATION
        Player: {
            id: 1,
            MaxHealth: 100,
            CurrentHealth: 100,
            PosX: 4,
            PosY: 4,
            SpriteName: 'Knight',
            PrimaryWeapon: {
                id: 1,
                Name: 'Sword',
                Damage: 10,
                Type: 0
            },
            SecondaryWeapon: {
                id: 2,
                Name: 'Bow',
                Damage: 5,
                Type: 1
            }
        },
        Floor: {
            Theme: Theme,
            Level: 1,
            Rooms: [
                [
                    {
                        id: 1,
                        Type: 0,
                        Tiles: 'wwwwwwwwwwwwww...........ww...........ww...........w............ww...........ww...........ww...........wwwwwwwwwwwwww',
                        Left: 2,
                        Enemies: [
                            {
                                id: 1,
                                MaxHealth: 10,
                                CurrentHealth: 10,
                                PosX: 10,
                                PosY: 3,
                                Damage: 5,
                                SpriteName: 'Werewolf',
                                Level: 1
                            },
                            {
                                id: 2,
                                MaxHealth: 15,
                                CurrentHealth: 15,
                                PosX: 2,
                                PosY: 2,
                                Damage: 15,
                                SpriteName: 'Dog',
                                Level: 2
                            },
                            {
                                id: 3,
                                MaxHealth: 20,
                                CurrentHealth: 20,
                                PosX: 7,
                                PosY: 7,
                                Damage: 20,
                                SpriteName: 'GoldKnight',
                                Level: 3
                            }
                        ]
                    },
                    {
                        id: 2,
                        Type: 0,
                        Tiles: 'wwwwww.wwwwwww...........ww...........ww...........ww............w...........ww...........ww...........wwwwwwwwwwwwww',
                        Right: 1,
                        Top: 3,
                        Enemies: [
                            {
                                id: 4,
                                MaxHealth: 10,
                                CurrentHealth: 10,
                                PosX: 10,
                                PosY: 3,
                                Damage: 5,
                                SpriteName: 'Mushroom',
                                Level: 1
                            },
                            {
                                id: 5,
                                MaxHealth: 15,
                                CurrentHealth: 15,
                                PosX: 2,
                                PosY: 2,
                                Damage: 15,
                                SpriteName: 'Mushroom',
                                Level: 2
                            },
                            {
                                id: 6,
                                MaxHealth: 20,
                                CurrentHealth: 20,
                                PosX: 7,
                                PosY: 7,
                                Damage: 20,
                                SpriteName: 'Mushroom',
                                Level: 3
                            }
                        ]
                    },
                    {
                        id: 3,
                        Type: 0,
                        Tiles: 'wwwwwwwwwwwwww...........ww...........ww...........ww...........ww...........ww...........ww...........wwwwwww.wwwwww',
                        Bottom: 2,
                        Enemies: [
                            {
                                id: 7,
                                MaxHealth: 10,
                                CurrentHealth: 10,
                                PosX: 10,
                                PosY: 3,
                                Damage: 5,
                                SpriteName: 'Mushroom',
                                Level: 1
                            },
                            {
                                id: 8,
                                MaxHealth: 15,
                                CurrentHealth: 15,
                                PosX: 2,
                                PosY: 2,
                                Damage: 15,
                                SpriteName: 'Mushroom',
                                Level: 2
                            },
                            {
                                id: 9,
                                MaxHealth: 20,
                                CurrentHealth: 20,
                                PosX: 7,
                                PosY: 7,
                                Damage: 20,
                                SpriteName: 'Mushroom',
                                Level: 3
                            }
                        ]
                    }
                ],
            ]
        }
    };
    return game;
}

export async function saveGame(FloorData: Partial<GameObject>): Promise<void> {
    try {
        const response = await fetch('/api/Save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(FloorData)
        });

        if (!response.ok) throw new Error('Failed to save game');
        
        console.log('Game saved successfully');
    } catch (error) {
        console.error('Error saving game:', error);
    }
}

export async function getStoryText(): Promise<string> {
    try {
        const response = await fetch('/api/GetText');
        if (!response.ok) throw new Error('Failed to fetch story');
        
        const story: StoryResponse = await response.json();
        return story.Text;
    } catch (error) {
        console.error('Error fetching story:', error);
        return 'Once upon a time, in a land far away...\n\nLuke Skywalker has returned to his home planet of Tatooine in an attempt to rescue his friend Han Solo from the clutches of the vile gangster Jabba the Hutt. Little does Luke know that the GALACTIC EMPIRE has secretly begun construction on a new armored space station even more powerful than the first dreaded Death Star. When completed, this ultimate weapon will spell certain doom for the small band of rebels struggling to restore freedom to the galaxy...';
    }
}