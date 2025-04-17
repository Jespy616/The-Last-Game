import type { RoomObject } from "../backend/types";

const tileProperties: { [key: number]: boolean } = {
        0: true, // Inner top-left wall
        1: true, // Top branch wall
        2: false, // Stairs
        3: false, // Cracked Floor
        4: false, // Slightly cracked Floor
        5: true, // Inner top-right wall
        6: true, // + wall
        7: true, // Top-left corner wall
        8: true, // Top wall
        9: true, // Top-right corner wall
        10: true, // Inner bottom-left wall
        11: true, // Inner vertical wall
        12: true, // Left wall
        13: false, // Floor
        14: true, // Right wall
        15: true, // Inner bottom-right wall
        16: true, // Bottom branch wall
        17: true, // Bottom-left corner wall
        18: true, // Bottom wall
        19: true, // Bottom-right corner wall
    };

const generateTileIDs = (charMatrix: string[][]): number[][] => {
    function getTileId(charMatrix: string[][], x: number, y: number): number {
        const char = charMatrix[y][x];
        if (char === '.') return 13; // Floor

        const top = y > 0 ? charMatrix[y - 1][x] : null;
        const bottom = y < charMatrix.length - 1 ? charMatrix[y + 1][x] : null;
        const left = x > 0 ? charMatrix[y][x - 1] : null;
        const right = x < charMatrix[0].length - 1 ? charMatrix[y][x + 1] : null;

        switch (true) {
            case top === 'w' && bottom === 'w' && left === 'w' && right === 'w':
                return 6; // + wall
            case left === '.' && right === '.':
                return 11; // Inner vertical wall
            case top === 'w' && left === 'w' && right === '.':
                return 15; // Inner bottom-right wall
            case top === 'w' && left === '.' && right === 'w':
                return 10; // Inner bottom-left wall
            case bottom === 'w' && left === 'w' && right === '.':
                return 5; // Inner top-right wall
            case bottom === 'w' && left === '.' && right === 'w':
                return 0; // Inner top-left wall
            case top === 'w' && left === 'w' && right === 'w':
                return 16; // Bottom branch wall
            case bottom === 'w' && left === 'w' && right === 'w':
                return 1; // Top branch wall
            case top === '.':
                return 18; // Bottom wall
            case bottom === '.':
                return 8; // Top wall
            case left === '.':
                return 14; // Right wall
            case right === '.':
                return 12; // Left wall
            case top === 'w' && left === 'w':
                return 19; // Bottom-right corner wall
            case top === 'w' && right === 'w':
                return 17; // Bottom-left corner wall
            case bottom === 'w' && left === 'w':
                return 9; // Top-right corner wall
            case bottom === 'w' && right === 'w':
                return 7; // Top-left corner wall
            default:
                return 13; // Floor
        }
    }
    const height = charMatrix.length;
    const width = charMatrix[0].length;
    const convertedTilemap: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tileId = getTileId(charMatrix, x, y);
            convertedTilemap[y][x] = tileId;
        }
    }
    return convertedTilemap;
}

export const createTilemap = (scene: Phaser.Scene, tiles: string, tilesetKey: string, room: RoomObject): Phaser.Tilemaps.Tilemap => {
    const tileMatrix = convertToMatrix(tiles);
    // Create pathways for other rooms
    if (room.TopID) {
        tileMatrix[0][6] = '.';
    }
    if (room.BottomID) {
        tileMatrix[8][6] = '.';
    }
    if (room.LeftID) {
        tileMatrix[4][0] = '.';
    }
    if (room.RightID) {
        tileMatrix[4][12] = '.';
    }
    const tileIDs = generateTileIDs(tileMatrix);
    // Add stairs (if any)
    if (room.Type == 2) {
        try {
            tileIDs[room.StairY!][room.StairX!] = 2; // Add stairs
        }
        catch (error) {
            tileIDs[4][6] = 2; // Default to center if out of bounds
        }
    }

    const map = scene.make.tilemap({
        data: tileIDs,
        tileWidth: 16,
        tileHeight: 16
    });

    const tileset = map.addTilesetImage(tilesetKey);
    if (tileset) {
        map.createLayer(0, tileset, 0, 0);
    } else {
        console.error('Tileset is null');
    }

    assignCollisions(map);
    return map;
}

const assignCollisions = (map: Phaser.Tilemaps.Tilemap) => {
    const layer = map.layers[0];

    layer.data.forEach(row => {
        row.forEach(tile => {
            if (tileProperties[tile.index]) {
                tile.setCollision(true);
                tile.properties = { ge_collide: true };
            }
        });
    });
}

const convertToMatrix = (charString: string): string[][] => {
    const rows = Math.ceil(charString.length / 13);
    const matrix: string[][] = [];

    for (let i = 0; i < rows; i++) {
        const start = i * 13;
        const end = start + 13;
        matrix.push(charString.slice(start, end).split(''));
    }

    return matrix;
}