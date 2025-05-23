import { Direction, GridEngine } from 'grid-engine';
import { Subscription, take } from 'rxjs';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import type { FloorObject, GameObject, PlayerObject, RoomObject } from '../backend/types';
import { createTilemap } from '../util/CreateTilemap';
import { createPlayerAnimation, createEnemyAnimation, createChestAnimation, destroyAnimations } from '../util/Animations';
import { playerAttack, handleEnemyTurns } from '../util/Combat';
import { EnemyHealthBar } from '../ui/EnemyHealthBar';
import { openChest } from '../util/Chests';

export class Room extends Scene {
    camera!: Phaser.Cameras.Scene2D.Camera;
    private room!: RoomObject;
    private player!: PlayerObject;
    private gameData!: GameObject;
    private startX!: number;
    private startY!: number;
    private startFrame!: number;
    private gridEngine!: GridEngine;
    private inputEnabled: boolean = true;
    private observers: Subscription[] = [];


    constructor() {
        super('Room');
    }

    init(data: { roomId: number, gameData: GameObject, pos: string }) {
        this.gameData = data.gameData;
        this.room = this.gameData.Floor.Rooms.find((room) => room.ID === data.roomId)!;
        this.player = this.gameData.Player;
        switch (data.pos) {
            case 'right':
                this.startX = 12;
                this.startY = 4;
                this.startFrame = 7;
                break;
            case 'left':
                this.startX = 0;
                this.startY = 4;
                this.startFrame = 11;
                break;
            case 'top':
                this.startX = 6;
                this.startY = 0;
                this.startFrame = 3;
                break;
            case 'bottom':
                this.startX = 6;
                this.startY = 8;
                this.startFrame = 15;
                break;
            case 'center':
                this.startX = 6;
                this.startY = 4;
                this.startFrame = 3;
                break;
        }
        for (let room of this.gameData.Floor.Rooms) {
            for (let enemy of room.Enemies) {
                enemy.Sprite = `${this.gameData.Floor.Theme}`;
            }
        }
    }

    preload() {
        this.load.audio("YWWWS", 'assets/audio/YWWWS.ogg');
        this.load.image(`${this.gameData.Floor.Theme}-tiles`, `assets/tilesets/${this.gameData.Floor.Theme}-tileset.png`);
        this.load.spritesheet('player', `assets/${this.player.SpriteName}.png`, {
            frameWidth: 24,
            frameHeight: 24,
        });
        for (let enemy of this.room.Enemies) {
            this.load.spritesheet(`enemy${enemy.ID}`, `assets/enemies/${enemy.Sprite}${enemy.Level}.png`, {
                frameWidth: 32,
                frameHeight: 32,
            });
        }
        if (this.room.Chest != null) {
            this.load.spritesheet('chest', `assets/chest.png`, {
                frameWidth: 16,
                frameHeight: 16,
            });
        }
    }

    create() {
        this.camera = this.cameras.main;
        EventBus.emit('current-scene-ready', this);

        if (!this.scene.isActive('MusicManager')) {
            // First time initialization
            this.scene.launch('MusicManager');
            this.scene.get('MusicManager').events.emit('playMusic', 'YWWWS');
        } else {
            // Scene exists but music might not be playing
            const musicManager = this.scene.get('MusicManager');
            if (!musicManager.isPlaying()) {
                musicManager.events.emit('playMusic', 'YWWWS');
            }
        }

        // Create Tilemap
        const tilemap = createTilemap(this, this.room.Tiles, `${this.gameData.Floor.Theme}-tiles`, this.room);
        
        // Create Player and Health Bar
        this.player.SpriteObject = this.add.sprite(0, 0, 'player');

        // Start the GUI scene
        this.scene.launch('Gui', this.player);

        // Create Player Animation
        createPlayerAnimation(this, 'player-interact-down', 2, 3);
        createPlayerAnimation(this, 'player-interact-left', 6, 7);
        createPlayerAnimation(this, 'player-interact-right', 10, 11);
        createPlayerAnimation(this, 'player-interact-up', 14, 15);

        // Set Camera to Follow Player
        this.cameras.main.startFollow(this.player.SpriteObject, true);
        this.cameras.main.setFollowOffset(
            -this.player.SpriteObject.width / 2,
            -this.player.SpriteObject.height / 2
        );
        this.cameras.main.setZoom(5);

        // Create Enemy Animations
        for (let enemy of this.room.Enemies) {
            createEnemyAnimation(this, enemy.ID, 'walk');
            createEnemyAnimation(this, enemy.ID, 'idle');
            createEnemyAnimation(this, enemy.ID, 'attack');
        }

        // Create Enemies and Health Bars
        for (let enemy of this.room.Enemies) {
            enemy.SpriteObject = this.add.sprite(0, 0, `enemy${enemy.ID}`);
            enemy.SpriteObject.anims.play(`enemy${enemy.ID}-idle`);
            enemy.healthBar = new EnemyHealthBar(this, 0, 0, enemy.CurrentHealth, enemy.MaxHealth);
        }

        // Create Chest (If applicable)
        if (this.room.Chest != null) {
            this.room.Chest.SpriteObject = this.add.sprite(0, 0, 'chest');
            createChestAnimation(this);
        }

        // Configure Grid Engine
        const gridEngineConfig = {
            characters: [
                {
                    id: 'player',
                    sprite: this.player.SpriteObject,
                    walkingAnimationMapping: {
                        down: { leftFoot: 0, standing: 1, rightFoot: 2 },
                        left: { leftFoot: 4, standing: 5, rightFoot: 6 },
                        right: { leftFoot: 8, standing: 9, rightFoot: 10 },
                        up: { leftFoot: 12, standing: 13, rightFoot: 14 },
                    },
                    startPosition: { x: this.startX, y: this.startY },
                    offsetY: -4,
                },
                // Chest
                ...(this.room.Chest ? [{
                    id: 'chest',
                    sprite: this.room.Chest.SpriteObject,
                    startPosition: { x: -100, y: -100 }, // Set to off-screen initially
                    offsetY: -4,
                }] : []),
                // Enemies
                ...this.room.Enemies.map(enemy => ({
                    id: `enemy${enemy.ID}`,
                    sprite: enemy.SpriteObject,
                    startPosition: { x: enemy.PosX, y: enemy.PosY },
                    offsetY: -4,
                })),
            ],
        };

        // Create Grid Engine
        this.gridEngine.create(tilemap, gridEngineConfig);

        this.player.SpriteObject.setFrame(this.startFrame);

        if (this.room.Chest != null) {
            if (this.room.Chest.Opened) {
                this.room.Chest.SpriteObject!.setFrame(3);
            }
            else {
                this.room.Chest.SpriteObject!.setFrame(0);
            }
        }

        this.checkRoomCleared(); // If a Chest room and no enemies, set Chest position
        this.inputEnabled = true;

        const moveStart = this.gridEngine.movementStarted().subscribe(({ direction, charId }) => {
            // Player Movement: Enemies follow
            if (charId === 'player') {
                for (let enemy of this.room.Enemies) {
                    this.gridEngine.follow(enemy.SpriteObject!.texture.key, 'player', 0, true);
                }
            }
            // Enemy Movement: Play walk animation
            else if (charId.startsWith('enemy')) {
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
                this.player.PosX = this.gridEngine.getPosition('player').x;
                this.player.PosY = this.gridEngine.getPosition('player').y;

                this.checkRoomChange(this.gridEngine.getPosition('player').x, this.gridEngine.getPosition('player').y);
                this.checkFloorChange();
            }
            // Enemy Stopped: Save position and play idle animation
            else if (charId.startsWith('enemy')) {
                const enemy = this.room.Enemies.find(e => e.SpriteObject!.texture.key === charId)!;
                if (enemy) {
                    enemy.SpriteObject!.anims.stop();
                    enemy.SpriteObject!.anims.play(`${charId}-idle`);

                    enemy.PosX = this.gridEngine.getPosition(enemy.SpriteObject!.texture.key).x;
                    enemy.PosY = this.gridEngine.getPosition(enemy.SpriteObject!.texture.key).y;
                }

            }
        });

        const posFinish = this.gridEngine.positionChangeFinished().subscribe(async ({ charId }) => {
            // Player reaches new tile: Handle enemy turns
            if (charId === 'player') {
                this.player.CurrentHealth = Math.min(this.player.CurrentHealth + 1, this.player.MaxHealth);
                await handleEnemyTurns(this, this.player, this.room.Enemies).then(() => {
                    this.inputEnabled = true;
                });
            }
        });

        const posStart = this.gridEngine.positionChangeStarted().subscribe(({ charId }) => {
            // Enemy starts moving: Stop movement (occurs after enemy reaches new tile)
            if (charId.startsWith('enemy')) {
                this.gridEngine.stopMovement(charId);
            }
        });

        this.events.on('update', () => {
            // Check Player Death
            if (this.player.SpriteObject && this.player.CurrentHealth <= 0) {
                this.changeScene('GameOver');
            }
            // Update Enemy Health Bars
            for (let enemy of this.room.Enemies) {
                if (enemy && enemy.healthBar && enemy.SpriteObject) {
                    enemy.healthBar.updatePosition(enemy.SpriteObject.x + enemy.SpriteObject.width / 2, enemy.SpriteObject.y + enemy.SpriteObject.height / 2);
                    enemy.healthBar.updateHealth(enemy.CurrentHealth);

                    // Check Enemy Death
                    if (enemy.CurrentHealth <= 0) {
                        this.gridEngine.removeCharacter(enemy.SpriteObject!.texture.key);
                        enemy.SpriteObject!.destroy();
                        this.room.Enemies.splice(this.room.Enemies.indexOf(enemy), 1);
                        this.checkRoomCleared();
                    }
                }
            }
        });

        this.observers.push(moveStart, moveStop, posFinish, posStart);

        EventBus.on('change-scene', ({ sceneKey }: { sceneKey: string }) => {
            this.changeScene(sceneKey);
        });
    }

    checkRoomCleared() {
        if (this.room.Enemies.length === 0) {
            this.room.Cleared = true;

            if (this.room.Chest != null) {
                this.gridEngine.setPosition('chest', {x: this.room.Chest.PosX, y: this.room.Chest.PosY});
            }
        }
    }

    checkFloorChange() {
        if (this.room.Type === 2 && this.gridEngine.getPosition('player').x === this.room.StairX && this.gridEngine.getPosition('player').y === this.room.StairY) {
            this.changeScene('ThemeSelection', { gameData: this.gameData });
        }
    }

    checkRoomChange(x: number, y: number) {
        if (x === 0 && y === 4 && this.gridEngine.getFacingDirection('player') === Direction.LEFT && this.room.LeftID) {
            this.changeScene('Room', { roomId: this.room.LeftID, pos: 'right' });
        }
        else if (x === 12 && y === 4 && this.gridEngine.getFacingDirection('player') === Direction.RIGHT && this.room.RightID) {
            this.changeScene('Room', { roomId: this.room.RightID, pos: 'left' });
        }
        else if (x === 6 && y === 0 && this.gridEngine.getFacingDirection('player') === Direction.UP && this.room.TopID) {
            this.changeScene('Room', { roomId: this.room.TopID, pos: 'bottom' });
        }
        else if (x === 6 && y === 8 && this.gridEngine.getFacingDirection('player') === Direction.DOWN && this.room.BottomID) {
            this.changeScene('Room', { roomId: this.room.BottomID, pos: 'top' });
        }
    }

    changeScene(sceneKey: string, data?: any) {
        for (let observer of this.observers) {
            observer.unsubscribe();
        }
        this.sound.play("transition", { volume: 0.6 });

        for (let observer of this.observers) {
            observer.unsubscribe();
        }
        destroyAnimations(this);
        this.inputEnabled = true;
        this.scene.pause()
        this.scene.launch('Transition', {
            prevSceneKey: 'Room',
            nextSceneKey: sceneKey,
            nextSceneData: { ...data, gameData: this.gameData }
        });
        if (sceneKey === 'GameOver' || sceneKey === 'MainMenu' || sceneKey === 'ThemeSelection') {
            this.scene.stop('Gui');
        }
    }

    async playerInteract(direction: Direction) {
        // Player interacts/attacks in the direction they are facing
        const playerSprite = this.gridEngine.getSprite('player');

        playerSprite!.anims.play(`player-interact-${direction}`);
        const targetPos = this.gridEngine.getFacingPosition('player');

        // Check if there is an enemy at the target position
        const interactingObject = this.gridEngine.getCharactersAt(targetPos).pop()
        if (interactingObject) {
            if (interactingObject.startsWith('enemy')) {
                const enemyIdNumber = parseInt(interactingObject.replace('enemy', ''));
                const enemy = this.room.Enemies.find(enemy => enemy.ID === enemyIdNumber)!;
                await playerAttack(this, enemy, this.player);
                await handleEnemyTurns(this, this.player, this.room.Enemies)
            }
            else if (interactingObject === 'chest') {
                await openChest(this, this.room.Chest!, this.player);
            }
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
            case 'down':
                this.gridEngine.move('player', Direction.DOWN);
                break;
            case 'esc':
                this.scene.pause();
                console.log("From room page:")
                console.log(this.gameData)
                this.scene.launch('SettingsOverlay', {gameData: this.gameData});
                break;
            default:
                break;
        }

        if (this.gridEngine.isMoving('player')) {
            await new Promise(resolve => {
                this.gridEngine.positionChangeFinished()
                    .pipe(take(1))
                    .subscribe(() => resolve(true));
            });
        }
        else {
            this.inputEnabled = true;
        }
    }

    update() {
        if (this.inputEnabled) {
            const cursors = this.input.keyboard?.createCursorKeys()!;
            const esc = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
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
            } else if (esc?.isDown) {
                this.handleInput('esc');
            }
        }
    }

}
