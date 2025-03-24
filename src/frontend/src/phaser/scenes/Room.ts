import { Direction, GridEngine } from 'grid-engine';
import { Subscription } from 'rxjs';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import type { GameObject, PlayerObject, RoomObject } from '../backend/types';
import { createTilemap } from '../util/CreateTilemap';
import { createPlayerAnimation, createEnemyAnimation, destroyAnimations } from '../util/Animations';
import { playerAttack, handleEnemyTurns } from '../util/Combat';
import { EnemyHealthBar } from '../ui/EnemyHealthBar';

export class Room extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    private room: RoomObject;
    private player: PlayerObject;
    private gameData: GameObject;
    private startX: number;
    private startY: number;
    private startFrame: number;
    private gridEngine!: GridEngine;
    private inputEnabled: boolean = true;
    private observers: Subscription[] = [];
    

    constructor() {
        super('Room');
    }

    init(data: { roomId: number, gameData: GameObject, pos: string }) {
        this.gameData = data.gameData;
        this.room = this.gameData.floor.rooms.flat().find((room) => room.id === data.roomId)!;
        this.player = this.gameData.player;
        switch (data.pos) {
            case 'right':
                this.startX = 14;
                this.startY = 4;
                this.startFrame = 7;
                break;
            case 'left':
                this.startX = 0;
                this.startY = 4;
                this.startFrame = 11;
                break;
            case 'top':
                this.startX = 7;
                this.startY = 0;
                this.startFrame = 3;
                break;
            case 'bottom':
                this.startX = 7;
                this.startY = 8;
                this.startFrame = 15;
                break;
            case 'center':
                this.startX = 7;
                this.startY = 4;
                this.startFrame = 3;
                break;
        }
    }

    preload() {
        this.load.image('tiles', `assets/tilesets/${this.gameData.floor.theme}-tileset.png`);
        this.load.spritesheet('player', `assets/${this.gameData.player.spriteName}.png`, {
            frameWidth: 24,
            frameHeight: 24,
        });
        for (let enemy of this.room.enemies) {
            this.load.spritesheet(`enemy${enemy.id}`, `assets/enemies/${enemy.spriteName}${enemy.level}.png`, {
                frameWidth: 32,
                frameHeight: 32,
            });
        }
    }

    create() {
        this.camera = this.cameras.main;
        EventBus.emit('current-scene-ready', this);

        // Create Tilemap
        const tilemap = createTilemap(this, this.room.tiles, 'tiles');
        
        // Create Player and Health Bar
        this.player.spriteObject = this.add.sprite(0, 0, 'player'); 

        // Start the GUI scene
        this.scene.launch('Gui', this.player);

        // Create Player Animation
        createPlayerAnimation(this, 'player-interact-down', 2, 3);
        createPlayerAnimation(this, 'player-interact-left', 6, 7);
        createPlayerAnimation(this, 'player-interact-right', 10, 11);
        createPlayerAnimation(this, 'player-interact-up', 14, 15);

        // Set Camera to Follow Player
        this.cameras.main.startFollow(this.player.spriteObject, true);
        this.cameras.main.setFollowOffset(
            -this.player.spriteObject.width / 2,
            -this.player.spriteObject.height / 2
        );
        this.cameras.main.setZoom(4);
        
        // Create Enemy Animations
        for (let enemy of this.room.enemies) {
            createEnemyAnimation(this, enemy.id, 'walk');
            createEnemyAnimation(this, enemy.id, 'idle');
            createEnemyAnimation(this, enemy.id, 'attack');
        }

        // Create Enemies and Health Bars
        for (let enemy of this.room.enemies) {
            enemy.spriteObject = this.add.sprite(0, 0, `enemy${enemy.id}`);
            enemy.spriteObject.anims.play(`enemy${enemy.id}-idle`);
            enemy.healthBar = new EnemyHealthBar(this, 0, 0, enemy.currentHealth, enemy.maxHealth);
        }
        
        this.events.on('update', () => {
            // Check Player Death
            if (this.player.spriteObject && this.player.currentHealth <= 0) {
                this.gridEngine.removeCharacter(this.player.spriteObject!.texture.key);
                this.player.spriteObject!.destroy();
                this.changeScene();
            }
            // Update Enemy Health Bars
            for (let enemy of this.room.enemies) {
                if (enemy && enemy.healthBar && enemy.spriteObject) {
                    enemy.healthBar.updatePosition(enemy.spriteObject.x + enemy.spriteObject.width / 2, enemy.spriteObject.y + enemy.spriteObject.height / 2);
                    enemy.healthBar.updateHealth(enemy.currentHealth);

                    // Check Enemy Death
                    if (enemy.currentHealth <= 0) {
                        this.gridEngine.removeCharacter(enemy.spriteObject!.texture.key);
                        enemy.spriteObject!.destroy();
                        this.room.enemies.splice(this.room.enemies.indexOf(enemy), 1);
                    }
                }
            }
        });
        
        // Configure Grid Engine
        const gridEngineConfig = {
            characters: [
                {
                    id: 'player',
                    sprite: this.player.spriteObject,
                    walkingAnimationMapping: {
                        down: { leftFoot: 0, standing: 1, rightFoot: 2 },
                        left: { leftFoot: 4, standing: 5, rightFoot: 6 },
                        right: { leftFoot: 8, standing: 9, rightFoot: 10 },
                        up: { leftFoot: 12, standing: 13, rightFoot: 14 },
                    },
                    startPosition: { x: this.startX, y: this.startY },
                    offsetY: -4,
                },
                // Enemies
                ...this.room.enemies.map(enemy => ({
                    id: `enemy${enemy.id}`,
                    sprite: enemy.spriteObject,
                    startPosition: { x: enemy.posX, y: enemy.posY },
                    offsetY: -4,
                })),
            ],
        };
        
        // Create Grid Engine
        this.gridEngine.create(tilemap, gridEngineConfig);

        this.player.spriteObject.setFrame(this.startFrame);
        
        const moveStart = this.gridEngine.movementStarted().subscribe(({ direction, charId }) => {
            // Player Movement: Enemies follow
            if (charId === 'player') {
                for (let enemy of this.room.enemies) {
                    this.gridEngine.follow(enemy.spriteObject!.texture.key, 'player', 0, true);
                }
            }
            // Enemy Movement: Play walk animation
            else {
                const enemySprite = this.gridEngine.getSprite(charId);
                if (enemySprite) {
                    enemySprite.anims.stop();
                    enemySprite.anims.play(`${charId}-walk`);
                    enemySprite.flipX = direction === Direction.LEFT;
                }
            }
        });

        const moveStop = this.gridEngine.movementStopped().subscribe(({ charId }) => {
            // Player Stopped: Save position and check for room change
            if (charId === 'player') {
                this.player.posX = this.gridEngine.getPosition('player').x;
                this.player.posY = this.gridEngine.getPosition('player').y;

                this.checkRoomChange(this.gridEngine.getPosition('player').x, this.gridEngine.getPosition('player').y);
            }
            // Enemy Stopped: Save position and play idle animation
            else {
                const enemy = this.room.enemies.find(e => e.spriteObject!.texture.key === charId)!;
                if (enemy) {
                    enemy.spriteObject!.anims.stop();
                    enemy.spriteObject!.anims.play(`${charId}-idle`);

                    enemy.posX = this.gridEngine.getPosition(enemy.spriteObject!.texture.key).x;
                    enemy.posY = this.gridEngine.getPosition(enemy.spriteObject!.texture.key).y;
                }

            }
        });

        const posFinish = this.gridEngine.positionChangeFinished().subscribe(({ charId }) => {
            // Player reaches new tile: Handle enemy turns
            if (charId === 'player') {
                this.player.currentHealth = Math.min(this.player.currentHealth + 1, this.player.maxHealth);
                handleEnemyTurns(this.player, this.room.enemies);
            }
        });

        const posStart = this.gridEngine.positionChangeStarted().subscribe(({ charId }) => {
            // Enemy starts moving: Stop movement (occurs after enemy reaches new tile)
            if (charId.startsWith('enemy')) {
                this.gridEngine.stopMovement(charId);
            }
        });

        this.observers.push(moveStart, moveStop, posFinish, posStart);
    }

    checkRoomChange(x: number, y: number) {
        if (x === 0 && y === 4 && this.gridEngine.getFacingDirection('player') === Direction.LEFT && this.room.left) {
            this.changeRoom('right')
        }
        else if (x === 14 && y === 4 && this.gridEngine.getFacingDirection('player') === Direction.RIGHT && this.room.right) {
            this.changeRoom('left')
        }
        else if (x === 7 && y === 0 && this.gridEngine.getFacingDirection('player') === Direction.UP && this.room.top) {
            this.changeRoom('bottom')
        }
        else if (x === 7 && y === 8 && this.gridEngine.getFacingDirection('player') === Direction.DOWN && this.room.bottom) {
            this.changeRoom('top')
        }
    }

    changeRoom(pos: string) {
        let roomId: number | undefined;
        switch (pos) {
            case 'left':
                roomId = this.room.right;
                break;
            case 'right':
                roomId = this.room.left;
                break;
            case 'bottom':
                roomId = this.room.top;
                break;
            case 'top':
                roomId = this.room.bottom;
                break;
        }
        if (roomId) {
            for (let observer of this.observers) {
                observer.unsubscribe();
            }
            destroyAnimations(this);
            this.scene.start('Room', { roomId, gameData: this.gameData, pos});
        }
    }
    
    async playerInteract(direction: Direction) {
        // Player interacts/attacks in the direction they are facing
        const playerSprite = this.gridEngine.getSprite('player');

        playerSprite!.anims.play(`player-interact-${direction}`);
        const targetPos = this.gridEngine.getFacingPosition('player');

        // Check if there is an enemy at the target position
        const enemyID = this.gridEngine.getCharactersAt(targetPos).find(char => char.startsWith('enemy'));
        if (enemyID) {
            const enemyIdNumber = parseInt(enemyID.replace('enemy', ''));
            const enemy = this.room.enemies.find(enemy => enemy.id === enemyIdNumber)!;
            await playerAttack(enemy, this.player);
            await handleEnemyTurns(this.player, this.room.enemies)
        }
    }

    async handleInput(input: string) {
        // Disable input while game engine handles current input
        this.inputEnabled = false;

        switch (input) {
            case 'space':
                await this.playerInteract(this.gridEngine.getFacingDirection('player'));
                break;
            case 'left':
                this.gridEngine.move('player', Direction.LEFT);
                break;
            case 'right':
                this.gridEngine.move('player', Direction.RIGHT);
                break;
            case 'up':
                this.gridEngine.move('player', Direction.UP);
                break;
            default:
                this.gridEngine.move('player', Direction.DOWN);
                break;
        }

        if (this.gridEngine.isMoving('player')) {
            await new Promise(resolve => {
                this.gridEngine.positionChangeFinished().subscribe(() => resolve(true));
            });
        }

        this.inputEnabled = true;
    }

    update() {
        if (this.inputEnabled) {
            const cursors = this.input.keyboard?.createCursorKeys()!;
            if (cursors.left.isDown) {
                this.handleInput('left');
            } else if (cursors.right.isDown) {
                this.handleInput('right');
            } else if (cursors.up.isDown) {
                this.handleInput('up');
            } else if (cursors.down.isDown) {
                this.handleInput('down');
            } else if (cursors.space.isDown) {
                this.handleInput('space');
            }
        }
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
