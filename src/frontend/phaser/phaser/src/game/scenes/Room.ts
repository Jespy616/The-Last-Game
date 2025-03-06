import { Direction, GridEngine } from 'grid-engine';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import type { GameObject, RoomObject } from '../backend/types';

export class Room extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Room');
    }
    
    room: RoomObject;
    gameData: GameObject;
    startX: number;
    startY: number;
    startFrame: number;

    init(data: { roomId: number, gameData: GameObject, pos: string }) {
        this.room = data.gameData.floor.rooms.flat().find((room) => room.id === data.roomId)!;
        this.gameData = data.gameData;
        switch(data.pos) {
            case "right":
                this.startX = 14;
                this.startY = 4;
                this.startFrame = 7;
                break;
            case "left":
                this.startX = 0;
                this.startY = 4;
                this.startFrame = 11;
                break;
            case "top":
                this.startX = 7;
                this.startY = 0;
                this.startFrame = 3;
                break;
            case "bottom":
                this.startX = 7;
                this.startY = 8;
                this.startFrame = 15
                break;
            case "center":
                this.startX = 7;
                this.startY = 4;
                this.startFrame = 3;
                break;
        }
    }

    preload() 
    {
        this.load.image('tiles', `assets/tilesets/${this.gameData.floor.theme}-tileset.png`);
        // this.load.tilemapTiledJSON('tilemap', `assets/tilemaps/room${this.room.id}.json`);
        this.load.spritesheet('player', 'assets/knight.png', {
            frameWidth: 24,
            frameHeight: 24,
        });
        this.load.spritesheet('enemy', 'assets/enemies/Werewolf3.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    private gridEngine!: GridEngine; 
    create ()
    {
        
        this.camera = this.cameras.main;
        EventBus.emit('current-scene-ready', this);
        
        // Create Tilemap
        const tileIDs: number[][] = this.generateTileIDs(this.room.tiles);
        console.log('Tile IDs:', tileIDs);
        const tilemap = this.createTilemap(tileIDs, 'tiles');
        this.assignCollisions(tilemap, this.tileProperties);


        // Create Player
        const playerSprite = this.add.sprite(0, 0, "player");

        // Set Camera to Follow Player
        this.cameras.main.startFollow(playerSprite, true); 
        this.cameras.main.setFollowOffset( 
            -playerSprite.width / 2, 
            -playerSprite.height / 2
        );
        this.cameras.main.setZoom(4); 

        // Create Enemy
        const enemySprite = this.add.sprite(0, 0, "enemy");

        // Create Enemy Animations
        this.createEnemyAnimation('enemy-idle', 0, 3);
        this.createEnemyAnimation('enemy-walk', 4, 7);
        enemySprite.play('enemy-idle');
        
        // Configure Grid Engine
        const gridEngineConfig = { 
            characters: [ 
                { 
                    id: "player", 
                    sprite: playerSprite, 
                    walkingAnimationMapping: {
                        down: { leftFoot: 0, standing: 1, rightFoot: 2 },
                        left: { leftFoot: 4, standing: 5, rightFoot: 6 },
                        right: { leftFoot: 8, standing: 9, rightFoot: 10 },
                        up: { leftFoot: 12, standing: 13, rightFoot: 14 },
                    }, 
                    startPosition: { x: this.startX, y: this.startY }, 
                    offsetY: -4, 

                },
                { 
                    id: "enemy", 
                    sprite: enemySprite, 
                    startPosition: { x: 8, y: 7 },
                    offsetY: -4,
                },
            ], 
        }; 
        
        // Create Grid Engine
        this.gridEngine.create(tilemap, gridEngineConfig);
        
        playerSprite.setFrame(this.startFrame);

        this.gridEngine.movementStarted().subscribe(({ direction, charId }) => {
            if (charId === "enemy") {
                this.handleEnemyMovement(enemySprite, direction);
            }
            this.gridEngine.follow("enemy", "player", 1, true);
        });
        
        this.gridEngine.movementStopped().subscribe(({ charId }) => {
            if (charId === "enemy") {
                enemySprite.anims.stop();
                enemySprite.anims.play('enemy-idle');
            }
            this.stopAllCharactersExceptPlayer();
            this.handleRoomChange(this.gridEngine.getPosition("player").x, this.gridEngine.getPosition("player").y);
        });
    }

    tileProperties = {
        0: true, // Inner top-left wall
        1: true, // Top branch wall
        2: false, // Stairs
        3: false, // Cracked floor
        4: false, // Slightly cracked floor
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
    }
    
    generateTileIDs(charMatrix: string[][]): number[][] {
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

    createTilemap(tileData: number[][], tilesetKey: string): Phaser.Tilemaps.Tilemap {
        const map = this.make.tilemap({
            data: tileData,
            tileWidth: 16,
            tileHeight: 16
        });
    
        const tileset = map.addTilesetImage(tilesetKey);
        if (tileset) {
            const layer = map.createLayer(0, tileset, 0, 0);
        } else {
            console.error('Tileset is null');
        }    
        return map;
    }

    assignCollisions(map: Phaser.Tilemaps.Tilemap, geCollideMap: { [key: number]: boolean }) {
        const layer = map.layers[0];
    
        layer.data.forEach(row => {
            row.forEach(tile => {
                if (geCollideMap[tile.index]) {
                    tile.setCollision(true);
                    tile.properties = { ge_collide: true };
                }
            });
        });
    }

    createPlayerAnimation = (
        name: string,
        startFrame: number,
        endFrame: number,
    ) => {
        this.anims.create({
            key: name,
            frames: this.anims.generateFrameNumbers("player", {
            start: startFrame,
            end: endFrame,
            }),
            frameRate: 10,
            repeat: -1,
            yoyo: true,
        });
    }

    createEnemyAnimation = (key: string, startFrame: number, endFrame: number) => {
        this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers('enemy', { start: startFrame, end: endFrame }),
            frameRate: 10,
            repeat: -1,
            yoyo: false,
        });
    }

    handleEnemyMovement = (enemySprite: Phaser.GameObjects.Sprite, direction: Direction) => {
        enemySprite.anims.stop();
        enemySprite.anims.play('enemy-walk');
        enemySprite.flipX = direction === Direction.LEFT;
    }

    stopAllCharactersExceptPlayer = () => {
        for (let char of this.gridEngine.getAllCharacters()) {
            if (char !== "player") {
                this.gridEngine.stopMovement(char);
            }
        }
    }

    handleRoomChange = (x: number, y: number) => {
        if (x === 0 && y === 4 && this.gridEngine.getFacingDirection("player") === Direction.LEFT && this.room.left) {
            this.scene.start('Room', { roomId: this.room.left, gameData: this.gameData, pos: "right" });
        }
        else if (x === 14 && y === 4 && this.gridEngine.getFacingDirection("player") === Direction.RIGHT && this.room.right) {
            this.scene.start('Room', { roomId: this.room.right, gameData: this.gameData, pos: "left" });
        }
        else if (x === 7 && y === 0 && this.gridEngine.getFacingDirection("player") === Direction.UP && this.room.top) {
            this.scene.start('Room', { roomId: this.room.top, gameData: this.gameData, pos: "bottom" });
        }
        else if (x === 7 && y === 8 && this.gridEngine.getFacingDirection("player") === Direction.DOWN && this.room.bottom) {
            this.scene.start('Room', { roomId: this.room.bottom, gameData: this.gameData, pos: "top" });
        }
    }
    checkEnemiesAreInRange = () => {
        // Check if the enemy is in range
        const playerPos = this.gridEngine.getPosition("player");
        for (let char of this.gridEngine.getAllCharacters()) {
            if (char !== "player") {
                const enemyPos = this.gridEngine.getPosition(char);
                if (Math.abs(playerPos.x - enemyPos.x) <= 1 && Math.abs(playerPos.y - enemyPos.y) <= 1) {
                    this.enemyAttack(char);
                }
            }
        }
    }

    enemyAttack = (enemy: string) => {
        // Enemy attacks the player
        
    }
    
    update() { 
        const cursors = this.input.keyboard?.createCursorKeys()!; 
        if (cursors.left.isDown) { 
            this.gridEngine.move("player", Direction.LEFT); 
        } else if (cursors.right.isDown) { 
            this.gridEngine.move("player", Direction.RIGHT); 
        } else if (cursors.up.isDown) { 
            this.gridEngine.move("player", Direction.UP); 
        } else if (cursors.down.isDown) { 
            this.gridEngine.move("player", Direction.DOWN); 
        } 
    } 

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
