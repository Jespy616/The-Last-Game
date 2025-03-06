import type { GameObject } from "./types";
import type { StoryResponse } from "./types";

export async function getGame(difficultyLevel: number, theme: string): Promise<GameObject | null> {
    try {
        const response = await fetch('/api/GetGame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ difficultyLevel, theme })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const gameData: GameObject = await response.json();
        return gameData;
    } catch (error) {
        console.error('Error loading floor:', error);
        return null;
    }
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