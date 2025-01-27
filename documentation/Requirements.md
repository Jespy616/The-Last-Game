# Requirement Analysis of Last Game
**Developers: NaN**

## Description of the Project:


## Functional Requirements:
(* indicates A.I.-generated content)

### Must-Have:
* [**Save/Load States**](#saveload-states)
* [**Login/Register**](#loginregister)
* [**Turn-based player movement**](#turn-based-player-movement)
    * Move (up-down-left-right)
    * Attack
    * Heal*
    * Ability (?)
* [**Turn-based enemy behavior***](#turn-based-enemy-behavior)
    * Pathfinding
    * Attack
    * Block (?)
    * Heal (?)
* [**Player Stats**](#player-stats)
    * Attack
    * Ability (?)
    * Speed (?)
    * Defense (?)
* [**Damage Calculation***](#damage-calculation)
* [**In-Depth Tutorial**](#in-depth-tutorial)
* [**Interactable Elements:**](#interactable-elements)
    * [Enemies](#enemies)
    * [Chests](#chests)
    * [Walls and Doors](#walls-and-doors)
    * [Stairs](#stairs)
    * [Menu Boxes](#menu-boxes)
        * Stats/Inventory
        * Dialogue
        * Difficulty Setting
* [**A.I. Generation:**](#ai-generated-elements)
    * Floor Layouts
    * Room Contents
    * Items:
        * Rarity
        * Name
        * Damage
        * Type
        * Attack Speed (?)
    * Bosses/Enemies:
        * Name
        * Health
        * Damage
        * Dialogue (?)
* [**Sprites**](#sprites)
* [**Difficulty Choice**](#difficulty-choice)

### Should-Have:

* **Difficulty Rise**
* **Story**
* **Non Player Characters (NPCs)**
* **Experience/Leveling**
* **A.I.-Generated Sprites**
* **Sound Effects***
    * Move
    * Open Chest
    * Run into wall
    * Attack
    * Block
    * Ability (?)
    * Dialogue
    * Defeating Enemy
    * Player death
    * Experience gain/Level Up
    * Taking stairs

### Could-Have:
* **Inventory**
* **Status Effects***
* **Critical Hits***
* **Mini Map**
* **Dynamic Difficulty Adjustment (DDA)**
* **Allies***
* **Hardcore Mode (No revives)***
* **Music**

### Won't-Have:
* **Multiplayer***
* **Skill Tree**
* **Open-world exploration***


## In-Depth Descriptions

### Save/Load States
The game must include a robust save and load system to allow players to preserve their progress. Key details include:
1. **Auto-Save Triggers:** The game will auto-save after key events:
   - Opening a chest.
   - Before entering a boss fight.
   - When transitioning to a new floor.
2. **Manual Saves:** Players can manually save their progress from the menu, except during boss fights.
3. **Save Data Contents:** The following data will be stored:
   - Player stats (health, attack, defense, abilities, inventory).
   - Current floor.
   - Room progression (e.g., enemies defeated, bosses defeated, chests opened).
   - Player’s remaining lives.
4. **Single Save File:** Saves overwrite a single file, ensuring simplicity and avoiding confusion.

### Login/Register
Players must have the option to create and access accounts. This functionality will allow:
1. **Progress Tracking:** Saved progress tied to player accounts.
2. **In-Game Purchases:** The ability to retain purchases linked to the account.
3. **Implementation Notes:** This feature will require:
   - Basic username/password creation.
   - Account storage in an online database.

### Turn-Based Player Movement
Players will navigate the dungeon in discrete turns. Each turn allows for one action:
- **Move (Up-Down-Left-Right):** Players use arrow keys to move through the dungeon grid.
- **Attack:** Pressing the `SPACE` key will execute a basic attack against an adjacent enemy in the direction the player is facing.
- **Block/Heal:** The `SHIFT` key will allow players to resist all incoming damage for one turn. If there are no incoming attacks while the player is blocking, the player will heal for 5% of their max Health.
- **Abilities:** Special abilities (triggered by the `R` key) can heal, inflict status effects, or deal damage.

### Turn-Based Enemy Behavior
Enemies act in response to player movements. Enemy behavior includes:
1. **Pathfinding:** Enemies navigate toward the player, avoiding obstacles such as walls and chests.
2. **Attack:** Enemies attack the player if within range.
3. **Heal:** Enemies can self-heal under specific conditions:
   - Enemy health is below 50%.
   - Enemy is farther than one tile from the player.
   - The player has more health than the enemy.
4. **Turn Priority:** Enemies act based on their position in the grid, processed from top-left to bottom-right.

### Player Stats
Players’ progression is represented by their stats, which improve as they level up:
- **Attack:** Increases damage output.
- **Defense:** Reduces incoming damage.
- **Health:** Determines the player’s survivability.

### Damage Calculation
Damage is calculated using the following formulas:
- **Player Attack:** `Base Weapon Damage + (Base Weapon Damage x 0.05 x Player Attack)`.
- **Enemy Attack:** Enemies will use similar formulas but with their respective stats.
- **Defense Reduction:** `Damage Taken = Incoming Damage - (Incoming Damage x 0.95 x Defense Stat)`.

### Tutorial
An in-depth, hardcoded tutorial will be provided as an optional feature. Key aspects:
1. **Content:** Covers basic movement, interaction with elements (e.g., chests, enemies), and combat mechanics.
2. **Replayability:** Players can replay the tutorial via the settings menu.
3. **Design:** A simple 2-room floor with a chest room and stair room to familiarize players with core mechanics.

### Interactable Elements

#### Enemies
Enemies act as obstacles, challenging the player’s progress. Key traits:
1. **Spawn Behavior:**
   - Enemies spawn when a player enters a room.
   - They remain until defeated or the player leaves the floor.
2. **Movement:** Enemies pursue the player within the room but do not follow into new rooms.
3. **Combat:** Enemies can attack, block, or heal as described in their behavior.

#### Chests
Chests provide rewards and motivate exploration. Details:
1. **Spawn Conditions:** Appear in cleared Chest Rooms.
2. **Loot Table:**
   - **Weapons/Equipment:** Common (20%), Uncommon (12%), Rare (9%), Legendary (6%), Mythic (3%).
   - **EXP Boosts:** Small (15%), Medium (10%), Large (5%).
   - **Abilities:** 20% chance.
3. **Contents Scaling:** Loot quality improves with floor level and [floor difficulty](#difficulty-choice).

#### Walls and Doors
- **Walls:** Block player and enemy movement.
- **Doors:** Allow access between rooms.

#### Stairs
Stairs progress the player to the next floor. Found exclusively in cleared Stair Rooms.

#### Menu Boxes
Interactive UI elements include:
1. **Stats/Inventory:** Displays player attributes, abilities, weapons, and equipment.
2. **Dialogue:** Shows interactions with NPCs or enemies.
3. **Difficulty Settings:** Adjusts difficulty level before entering a new floor.

### AI-Generated Elements

#### Floor Layouts
Floors are procedurally generated with interconnected rooms:
1. **Room Requirements:**
   - At least 10 rooms.
   - Includes 1 Stair Room, 3 Chest Rooms, and randomized Normal, Hallway, and Trap Rooms.
2. **Special Room Rates:**
   - Stair Room: Exactly 1 per floor.
   - Chest Room: Guaranteed 3 per floor, then 10% chance for additional ones.
   - Hallway Room: 20% chance.
   - Trap Room: 3% chance.

#### Room Contents
Enemy spawns and room types are randomized. Room types include:
- **Normal Room:** Basic rectangular room with up to 4 doors.
- **Stair Room:** Contains stairs to the next floor after clearing enemies.
- **Chest Room:** Rewards a chest upon clearing enemies.
- **Hallway Room:** Long, narrow pathways with no enemies.
- **Trap Room:** Spawns additional enemies after clearing those that initially spawn.

#### Items
Randomized items include:
1. **Rarity:** Common, Uncommon, Rare, Legendary, Mythic.
2. **Attributes:** Name, damage, type (AoE, Ranged, Melee), and rarity.
3. **Scaling:** Higher rarity items provide better stats and effects.

#### Bosses and Enemies
Generated attributes include:
- **Name:** Unique identifiers.
- **Health:** Determines durability.
- **Defense:** Mitigates damage taken.
- **Attack:** Influences offensive capability.
- **Dialogue:** Key enemies or bosses may include dialogue to tie into story arcs.

### Sprites
Sprites visually represent characters, enemies, and environments. AI-generated sprites should align with the dungeon’s story or theme.

### Difficulty Choice
At the start of each floor, players choose from three difficulty levels:
1. **Easy:** Lower enemy stats and lower rate of spawn for rare loot.
2. **Medium:** Balanced difficulty and loot rates.
3. **Expert:** Stronger enemies, higher chances for rare loot, and increased experience gain.

To incentivize harder paths, rare item drop rates increase with difficulty. Easier paths provide weaker items and slower stat scaling.



#### Difficulty Rise
Although the player will have their choice of difficulty at each floor, the game's difficulty will generally increase as players progress deeper into the game. This means that, for instance, the "Hard" path on "Floor 1" should be substantially easier than the "Easy" path on "Floor 10."

#### Story
Narrative elements integrated to enhance player immersion.

#### Non Player Characters (NPCs)
Interactable characters providing dialogue, quests, and/or story progression.

#### Experience/Leveling
Players gain experience to level up and enhance stats or abilities.

#### A.I.-Generated Sprites
Sprites dynamically created to match procedurally generated elements. This would be an alternative to hard-coded sprites that would be reused by the A.I.

#### Sound Effects
Audio cues for various player actions and events:
* **Move:** [Description of sound]
* **Open Chest:**
* **Run into wall:**
* **Attack:**
* **Block:**
* **Ability (?):**
* **Dialogue"**
* **Defeating Enemy:**
* **Player death:**
* **Experience gain/Level Up:**
* **Taking stairs:**

#### Inventory
System to manage player-held items with possible qualities and constraints (e.g., stackable items, limited space). This would be a possible alternative to an easier-to-implement swap mechanic.

#### Status Effects
Temporary conditions affecting player or enemies (e.g., poison, paralysis).

#### Critical Hits
Chance-based mechanic for increased damage during attacks.

#### Mini Map
Provides a simplified view of the explored dungeon layout.

#### Dynamic Difficulty Adjustment (DDA)
Game difficulty dynamically scales based on player performance.

#### Allies
Companions assisting the player with unique abilities or actions.

#### Hardcore Mode (No revives)
A challenging mode where player death results in a permanent game over.

#### Multiplayer
Not included due to complexity and project scope.

#### Skill Tree
Not included as part of the gameplay mechanics.

#### Open-world exploration
Not included to maintain the dungeon-crawling structure of the game.



## Nonfunctional Requirements:

### Must-Have:

* Example text
* example text

### Should-Have:

* Example text
* Example text

### Could-Have
* Example Text
* Example text

### Won't-Have

* Example text
* Example text

## Business Requirements:

### Must-Have:

* Example text
* example text

### Should-Have:

* Example text
* Example text

### Could-Have
* Example Text
* Example text

### Won't-Have

* Example text
* Example text

## User Requirements:

### Must-Have:

* Example text
* example text
-- INSERT --
