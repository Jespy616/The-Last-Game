# Low Level Design

# [Please Look at this Link!! It has the rubric and needs for our document](https://usu.instructure.com/courses/769837/assignments/4714896)

## Introduction

---

## Backlog Development Plan
- ### Sprint Breakdown (Sprint Goals)
  - **Sprint 1** Implement the basic game loop, scene transitions, and backend communication
  - **Sprint 2** Build procedural rooms, interactive objects, and combat.
  - **Sprint 3** Ensure smooth UI integration, final testing, and additional features.

### Sprint Task Breakdown (Tasks to acheive Goals)
#### Sprint 1
- **Front end:**

  - **Scene Management**
    - [ ] Implement `MainMenuScene` with navigation buttons.
    - [ ] Implement `ThemeSelectionScene` and store the selected theme.
    - [ ] Implement `DifficultySelectionScene` and pass selection to the backend.
    - [ ] Implement `GameScene` as an empty shell.
    - [ ] Implement `GameOverScene` and ensure it triggers `SetHighScore(level)`.
  - **Backend API Calls**
    - [ ] Implement `GetFloor(difficultyLevel, theme)` to fetch level data.
    - [ ] Implement `Save(floorObject)` to update enemy/chest data.
    - [ ] Implement `SetHighScore(level)` to update leaderboard.
    - [ ] Implement `GetText()` to fetch AI-generated story text.
  - **Basic Player Controls**
    - [ ] Implement `move(direction)`.
    - [ ] Implement `checkCollision(Player, direction)`.
  - **Basic Enemy System**
    - [ ] Implement enemy movement towards the player (`enemyPathfind(Enemy, Player)`).
    - [ ] Implement simple enemy melee attack (`attack(Player)`).

- **Back end:**

#### Sprint 2
- **Front end:**

  - **Room Management**
    - [ ] Implement `RoomObject` and different room types (`NormalRoom`, `ChestRoom`, `StairRoom`).
    - [ ] Implement `getRoomAt(x, y)`.
    - [ ] Implement `loadRoom(Room room)`.
    - [ ] Implement `generateFloor(FloorObject floor)`.
    - [ ] Implement `generateRoom(RoomObject room)`.

  - **Combat & Health System**
    - [ ] Implement `attack(Player)` logic.
    - [ ] Implement enemy health tracking.
    - [ ] Implement player health tracking.

  - **Phaser-Svelte Integration**
    - [ ] Implement event handling to pause/resume Phaser when Svelte UI is open.
    - [ ] Ensure seamless UI overlay with proper layering.

  - **UI & Overlays**
    - [ ] Implement `ChestOpeningScene`.
    - [ ] Implement `LoseLifeScene`.
    - [ ] Implement `SettingsScene`.

- **Back end:**

#### Sprint 3
- **Front end:**
  - **Save Optimization**
    - [ ] Implement `compareFloorState(Floor oldFloor, Floor newFloor)`.
    - [ ] Ensure `Save()` only updates changed elements.
    - [ ] Call `Save()` when opening a chest (`openChest(Chest chest)`).
    - [ ] Call `Save()` when progressing to a new floor (`progressToNextFloor()`).
  - **Final Polish**
    - [ ] Optimize floor loading to load only adjacent rooms.
    - [ ] Implement animations for movement, attacks, and UI transitions.
    - [ ] Implement additional sound effects for interaction.
    - [ ] Final round of playtesting for balancing and bug fixes.

- **Back end:**

### All Tasks Outline (Summary of all Tasks)

---
## System Architecture
### Subsystems and UML Class Diagrams (Game UI - Phaser)

#### **Scene Structure & UML Layout**

The game consists of the following **scenes**:

1. **MainMenuScene** - Displays title screen, allows navigation to settings or new game.
2. **ThemeSelectionScene** - Lets the player choose a theme between 3 options.
3. **DifficultySelectionScene** - Selects difficulty (Easy-Medium-Hard); passes to backend for floor generation.
4. **StoryScene** - Displays AI-generated story text while a new floor loads.
5. **GameScene** - Main gameplay scene (handles player movement, enemy interactions, etc.).
6. **LoseLifeScene** - Triggered when the player dies but has remaining lives.
7. **GameOverScene** - Triggered when the player loses all lives; passes level to backend for high-score update.
8. **ChestOpeningScene** - Displays chest contents after opening; triggers save.
9. **SettingsScene** - Allows the player to manually save, adjust settings, or return to the main menu.

##### **Scene Interactions**
- `MainMenuScene` → `ThemeSelectionScene` → `DifficultySelectionScene` → `StoryScene` → `GameScene`
- `GameScene` → (`LoseLifeScene` or `ChestOpeningScene`) → `GameScene`
- `GameScene` → `GameOverScene` → `MainMenuScene`
- `SettingsScene` is accessible from `GameScene` at any time.

#### **Class Design & Inheritance**
Phaser will be passed all of this information from the backend when calling the `create-game` endpoint. It will create copies of all of these classes to update as the User interacts with the game. The following are the names and descriptions of all the classes that Phaser will use:

##### **Rooms**
```plaintext
Room (abstract)
│-- NormalRoom
│-- ChestRoom (contains a Chest)
│-- StairRoom (contains a Stair)
```
- `Room`
  - `number type` 0: Normal, 1: Chest, 2: Stair.
  - `string[][] tiles` Contains single-character entries denoting the type of tile.
  - `EnemyObject[] enemies` Contains all enemies within the room.
  - `boolean isCleared()`
  - `updateEnemies(EnemyObject[])`

##### **Interactable Objects**
```plaintext
Interactable (abstract)
│-- Chest
│-- Stair
```
- `Interactable`
  - `boolean interact(Player)`

##### **Other Classes**
- `Floor`
  - `String theme` The theme of the dungeon.
  - `number level` 
  - `RoomObject[][] rooms` Contains all room objects in the floor
  - `RoomObject getRoomAt(number x, number y)` Returns a given RoomObject
- `Player`
  - `number health, posX, posY`
  - `move(direction)` Updates posX and posY.
  - `Item primaryWeapon, secondaryWeapon`
- `Enemy`
  - `number health, posX, posY`
  - `Item weapon`
  - `attack(Player)`
- `Item`
  - `string sprite`
  - `number damage`
  - `number type` 0: Melee, 1: Ranged, 2: Sweep, 3: AoE

#### **Backend Interactions**

##### **API Endpoints**

| Endpoint | Request | Response | Purpose |
|----------|---------|----------|---------|
| `GetFloor(number difficultyLevel, String theme)` | `difficultyLevel, theme` | `FloorObject` | Retrieves floor layout, rooms, enemies. |
| `Save(Floor floorObject)` | `floorObject` | `200 OK` | Saves only updated enemy/chest attributes. |
| `GetText()` | None | `String` | Returns AI-generated story text. |
| `SetHighScore(number level)` | `level` | `200 OK` | Updates leaderboard on game over. |

#### **Utility Functions**

##### **1. Room & Floor Management**
- `loadRoom(Room room)`: Loads a room when entered.
- `generateFloor(FloorObject floor)`: Initializes floor data from backend response.
- `generateRoom(RoomObject room)`: Places tiles, enemies, and objects.

##### **2. Collision & Movement**
- `checkCollision(Player, direction)`: Ensures movement is valid.
- `enemyPathfind(Enemy, Player)`: Moves enemies toward the player.

##### **3. Save & Compare Changes**
- `compareFloorState(Floor oldFloor, Floor newFloor)`: Determines what changed before saving. This optimizes Save() by only sending to the backend what changed.
- `openChest(Chest chest)`: Calls `Save()` when a chest is opened. Prompts the user to take or leave the item.
- `progressToNextFloor()`: Calls `GetFloor()` for the next level.

#### **Phaser-Svelte Interaction**

- **Svelte UI overlays Phaser**, pausing the game when active.
- Phaser listens for an event to **resume** gameplay when UI is closed.
- Svelte handles **login, leaderboards, accessibility settings, and subscription services**; Phaser handles **all other UI**.

#### Front-End Objects

#### User Flow


### User Interfaces
#### Accessibility
#### Flow and Design for Pages
The Phaser application containing all game-related UI will be embeded within a Svelte page. Each component will work independently in a sort-of baton pass system to display all the necessary pages. The following UML diagram displays this interaction and outlines all frontend pages and scenes.

![Front-End UML](./assets/Frontend%20UML.png)
### Database Tables

### Backend UML

### System Performance

### Security Risks

---
## Programming Languages and Frameworks
### Front End
### Back End
### APIs and External Interfaces

## Deployment Plan
### These are ideas! I took them from the best example, we can come up with our own!
- **Development Environment Setup**
- **Staging Environment**
- **User Acceptance Testing**
- **Production Environment Testing**
- **Production Deployment**
- **Monitoring and Maintenance**
- **Scaling**