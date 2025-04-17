package game_manager

import (
	"backend/model"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"strconv"


	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type UserDTO struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	GameIDs  []uint `json:"game_ids"`
}

type saveGameRequest struct {
	Game model.Game `json:"game" binding:"required"`
}


type Floors struct {
	Rooms           map[string][][]string `json:"rooms"`
	FloorMap        [][]int               `json:"floorMap"`
	AdjacencyMatrix [][]string            `json:"adjacencyMatrix"`
	FloorTiles      string                `json:"floorTiles"`
	WallTiles       string                `json:"wallTiles"`
}

type Enemy struct {
	Attack float32    `json:"attack"`
	Health float32    `json:"health"`
	Sprite string `json:"sprite"`
}

type Weapon struct {
	Attack float32    `json:"attack"`
	Type   int    `json:"type"`
	Sprite string `json:"sprite"`
}

type FloorData struct {
	Floors  Floors   `json:"floors"`
	Enemies []Enemy  `json:"enemies"`
	Weapons []Weapon `json:"weapons"`
	Story   string   `json:"story"`
}
type RoomNeighbors struct {
	RoomID int
	Top    *int
	Bottom *int
	Left   *int
	Right  *int
}

type GameConfig struct {
	Theme     string `json:"theme" binding:"required"`
	Difficulty string `json:"difficulty" binding:"required"`
}

type FloorConfig struct {
	Theme     string `json:"theme" binding:"required"`
	Difficulty string `json:"difficulty" binding:"required"`
	Level int `json:"level" binding:"required"`
}

func getRoomNeighbors(floorMap [][]int) map[int]RoomNeighbors {
	neighbors := make(map[int]RoomNeighbors)
	rows := len(floorMap)
	cols := len(floorMap[0])
	for y := 0; y < rows; y++ {
		for x := 0; x < cols; x++ {
			roomID := floorMap[y][x]
			if roomID == 0 {
				continue
			}
			roomNeighbors := RoomNeighbors{RoomID: roomID}
			if y > 0 && floorMap[y-1][x] != 0 {
				roomNeighbors.Top = &floorMap[y-1][x]
			}
			if y < rows-1 && floorMap[y+1][x] != 0 {
				roomNeighbors.Bottom = &floorMap[y+1][x]
			}
			if x > 0 && floorMap[y][x-1] != 0 {
				roomNeighbors.Left = &floorMap[y][x-1]
			}
			if x < cols-1 && floorMap[y][x+1] != 0 {
				roomNeighbors.Right = &floorMap[y][x+1]
			}
			neighbors[roomID] = roomNeighbors
		}
	}
	return neighbors
}

func convertTilesToString(tiles [][]string) string {
	result := ""
	for _, row := range tiles {
		for _, col := range row {
			result += col
		}
	}
	return result
}

func toJSONString(v interface{}) string {
	data, _ := json.Marshal(v)
	return string(data)
}

func loadAPIKey() string {
	_ = godotenv.Load(".env-personal")
	_ = godotenv.Load(".env")
	return os.Getenv("API_KEY")
}

func runPythonAI(apiKey string, args1, enemies, weapons []string, theme string) ([]byte, error) {
	args1JSON, _ := json.Marshal(args1)
	enemiesJSON, _ := json.Marshal(enemies)
	weaponsJSON, _ := json.Marshal(weapons)

	cmd := exec.Command(
		"python3.11", "../ai/ai_agent.py",
		"-k", apiKey,
		"-f", "7", "cave",
		string(args1JSON), string(args1JSON),
		"-e", "4", string(enemiesJSON),
		"-w", "4", string(weaponsJSON),
		"-s", theme, theme, "None",
	)

	return cmd.CombinedOutput()
}

func parseAIResponse(output []byte) (FloorData, error) {
	var floorData FloorData
	err := json.Unmarshal(output, &floorData)
	return floorData, err
}

func buildAndSaveFloor(floorData FloorData, level float32, difficulty float32, theme string, c *gin.Context) (model.Floor, error) {
	floor := model.Floor{
		FloorMap:  toJSONString(floorData.Floors.FloorMap),
		Adjacency: toJSONString(floorData.Floors.AdjacencyMatrix),
		Rooms:     []model.Room{},
		StoryText: floorData.Story,
		Theme: theme,
	}

	if err := model.DB.Create(&floor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return floor, err
	}

	roomIndex := 0

	var multiplier = float32(0.1)
	for y, row := range floorData.Floors.FloorMap {
		for x, roomID := range row {
			if roomID == 0 {
				continue
			}

			normalRoom := 0
			chestRoom := 1
			stairRoom := 2

			roomName := fmt.Sprintf("room%d", roomIndex+1)
			roomTiles := convertTilesToString(floorData.Floors.Rooms[roomName])
			roomIndex++

			weaponData := floorData.Weapons[rand.Intn(len(floorData.Weapons))]
			weapon := model.Weapon{
				Damage: weaponData.Attack * (float32(1) + level * multiplier) * (float32(1) + level * multiplier) * difficulty,
				Sprite:       strings.Trim(weaponData.Sprite, "\""),
				Type:         weaponData.Type,
			}
			if err := model.DB.Create(&weapon).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return floor, err
			}

			room := model.Room{
				FloorID: &floor.ID,
				Tiles:   roomTiles,
				Enemies: []model.Enemy{},
				X: x,
				Y: y,
			}


			if err := model.DB.Create(&room).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return floor, err
			}

			if rand.Intn(4) == 1 {
				chestX := rand.Intn(6) + 2
				chestY := rand.Intn(10) + 2

				chest_loc := roomTiles[chestX * chestY]

				if chest_loc != '.' {
					for i, char := range roomTiles {
						if char == '.' {
							chestX = i / 13
							chestY = i % 9
						}
					}
				}


				chest := model.Chest{
					WeaponID: &weapon.ID,
					Weapon:   &weapon,
					PosX: chestX,
					PosY: chestY,
				}
				if err := model.DB.Create(&chest).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return floor, err
				}
				room.Chest = &chest
				room.ChestID = &chest.ID
				room.Type = &chestRoom
			}

			if roomIndex == 6 {
				room.Type = &stairRoom
				stairX := rand.Intn(6) + 2
				stairY := rand.Intn(10) + 2

				stair_loc := roomTiles[stairX * stairY]

				if stair_loc == '.' {
					room.StairX = &stairX
					room.StairY = &stairY
				} else {
					for i := len(roomTiles) - 1; i >= 0; i-- {
						if roomTiles[i] == '.' {
							stairX = i / 13
							stairY = i % 9
						}
					}
					room.StairX = &stairX
					room.StairY = &stairY
				}
			} else {
				room.Type = &normalRoom
			}



			var Enemies = []Enemy{
				{Attack: 5, Health: 5, Sprite: "1"},
				{Attack: 7.5, Health: 7.5, Sprite: "1"},
				{Attack: 10, Health: 10, Sprite: "1"},
			}


			enemyCount := rand.Intn(4)
			for i := 0; i < enemyCount; i++ {
				enemy_num := rand.Intn(len(Enemies))
				enemyData := Enemies[enemy_num]
				enemy := model.Enemy{
					Damage: enemyData.Attack * (float32(1) + level * multiplier) * difficulty,
					Level: enemy_num + 1,
					MaxHealth:      enemyData.Health * (float32(1) + level * multiplier) * (float32(1) + level * multiplier) * difficulty,
					CurrentHealth: enemyData.Health * (float32(1) + level * multiplier) * (float32(1) + level * multiplier) * difficulty,
					PosX: rand.Intn(11) + 1,
					PosY: rand.Intn(7) + 1,
					RoomID:      room.ID,
					Sprite: theme,
				}
				if err := model.DB.Create(&enemy).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return floor, err
				}
				room.Enemies = append(room.Enemies, enemy)
			}

			if err := model.DB.Save(&room).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return floor, err
			}
			floor.Rooms = append(floor.Rooms, room)
		}
	}

	neighbors := getRoomNeighbors(floorData.Floors.FloorMap)
	for _, rn := range neighbors {
		room := &floor.Rooms[rn.RoomID-1]
		if rn.Top != nil {
			top := *rn.Top - 1
			room.TopID = &floor.Rooms[top].ID
		}
		if rn.Bottom != nil {
			bottom := *rn.Bottom - 1
			room.BottomID = &floor.Rooms[bottom].ID
		}
		if rn.Left != nil {
			left := *rn.Left - 1
			room.LeftID = &floor.Rooms[left].ID
		}
		if rn.Right != nil {
			right := *rn.Right - 1
			room.RightID = &floor.Rooms[right].ID
		}
		if err := model.DB.Save(&room).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update neighbors"})
			return floor, err
		}
	}

	if err := model.DB.Save(&floor).Error; err != nil {
		return floor, err
	}

	return floor, nil
}

func CreateFloor(c *gin.Context) {
	var config FloorConfig

	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	apiKey := loadAPIKey()
	args1 := []string{"castle", "cave", "forest"}
	enemies := []string{"goblin", "bat", "knight"}
	weapons := []string{"sword", "spear", "bow"}

	output, err := runPythonAI(apiKey, args1, enemies, weapons, config.Theme)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI agent failed", "details": err.Error()})
		return
	}

	floorData, err := parseAIResponse(output)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parsing failed", "details": err.Error()})
		return
	}

	var difficultyMultiplier float32

	switch config.Difficulty {
	case "easy":
		difficultyMultiplier = 1.0
	case "medium":
		difficultyMultiplier = 1.5
	case "hard":
		difficultyMultiplier = 2.0
	default:
		difficultyMultiplier = 1.0 // fallback if unknown
	}

	floor, err := buildAndSaveFloor(floorData, float32(config.Level), difficultyMultiplier, config.Theme, c)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Floor created successfully", "floor": floor})
}

func CreateGame(c *gin.Context) {
	var config GameConfig

	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}


	userID := c.MustGet("userID").(uint)  // DELETE comment this out to make it work w/o logging in
	apiKey := loadAPIKey()
	args1 := []string{"castle", "cave", "forest"}
	enemies := []string{"goblin", "bat", "knight"}
	weapons := []string{"sword", "spear", "bow"}

	output, err := runPythonAI(apiKey, args1, enemies, weapons, config.Theme)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI agent failed", "details": err.Error()})
		return
	}

	floorData, err := parseAIResponse(output)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parsing failed", "details": err.Error()})
		return
	}

	var difficultyMultiplier float32

	switch config.Difficulty {
	case "easy":
		difficultyMultiplier = 1.0
	case "medium":
		difficultyMultiplier = 1.5
	case "hard":
		difficultyMultiplier = 2.0
	default:
		difficultyMultiplier = 1.0 // fallback if unknown
	}

	floor, err := buildAndSaveFloor(floorData, float32(1), difficultyMultiplier, config.Theme, c)
	if err != nil {
		return
	}

	primary_weapon := model.Weapon{
		Damage: 10,
		Sprite: "Primary",
		Type: 1,
	}

	if err := model.DB.Create(&primary_weapon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	start_room := floor.Rooms[0]
	startX := 6
	startY := 4

	if start_room.Tiles[4 * 9 + 6] != '.' {
		for i := len(start_room.Tiles) - 1; i >= 0; i-- {
			if start_room.Tiles[i] == '.' {
				startX = i / 13
				startY = i % 9
			}
		}
	}

	player := model.Player{
		MaxHealth: 75,
		CurrentHealth: 75,
		SpriteName: "Knight",
		PosX: startX,
		PosY: startY,
		PrimaryWeaponID: &primary_weapon.ID,
		PrimaryWeapon: &primary_weapon,
	}
	if err := model.DB.Create(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	game := model.Game{
		Level:                1,
		FloorID:              floor.ID,
		Floor:                floor,
		PlayerSpecifications: "Cool Game",
		PlayerID:             player.ID,
		Player:               player,
		UserID:				  userID, //DELETE turn this too a 1
	}
	if err := model.DB.Create(&game).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game created successfully", "game": game})
}

func SaveGame(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req saveGameRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "invalid request body",
				"details": err.Error(),
			})
			return
		}
		game := &req.Game // convenience pointer

		uidRaw, ok := c.Get("userID")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		userID, ok := uidRaw.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id in context"})
			return
		}
		game.UserID = userID // claim / re‑claim

		// Player
		if game.Player.ID != 0 {
			game.PlayerID = game.Player.ID
		}
		if game.Player.PrimaryWeapon != nil {
			game.Player.PrimaryWeaponID = &game.Player.PrimaryWeapon.ID
		}
		if game.Player.SecondaryWeapon != nil {
			game.Player.SecondaryWeaponID = &game.Player.SecondaryWeapon.ID
		}

		// Floor
		if game.Floor.ID != 0 {
			game.FloorID = game.Floor.ID
		}

		// Rooms / Enemies / Chests
		for i := range game.Floor.Rooms {
			room := &game.Floor.Rooms[i]
			room.FloorID = &game.Floor.ID

			for j := range room.Enemies {
				room.Enemies[j].RoomID = room.ID
			}

			if room.Chest != nil {
				room.Chest.RoomInID = &room.ID
				if room.Chest.Weapon != nil {
					room.Chest.WeaponID = &room.Chest.Weapon.ID
				}
			}
		}

		var err error
		if game.ID == 0 {
			// brand‑new: insert everything
			err = db.Session(&gorm.Session{FullSaveAssociations: true}).
				Create(game).Error
		} else {
			// existing: make sure the user owns it, then update
			var existing model.Game
			if err = db.Select("user_id").First(&existing, game.ID).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
					return
				}
				c.JSON(http.StatusInternalServerError, gin.H{"error": "db error", "details": err.Error()})
				return
			}
			if existing.UserID != userID {
				c.JSON(http.StatusForbidden, gin.H{"error": "you do not own this game"})
				return
			}

			err = db.Session(&gorm.Session{FullSaveAssociations: true}).
				Save(game).Error
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "failed to save game",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "game saved successfully",
			"game":    game,
		})
	}
}

func GetUser(c *gin.Context) {
	userID := c.Param("userId")

	var user model.User
	result := model.DB.First(&user, "ID = ?", userID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func GetGames(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// 2) Make sure the user exists
	var user model.User
	if err := model.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// 3) Collect all game IDs that belong to this user
	var gameIDs []uint
	if err := model.DB.
		Model(&model.Game{}).
		Where("user_id = ?", userID).
		Pluck("id", &gameIDs).
		Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch games"})
		return
	}

	// 4) Respond
	c.JSON(http.StatusOK, gin.H{
		"user_id":  userID,
		"game_ids": gameIDs,
	})
}

func GetPlayer(c *gin.Context) {
	playerID := c.Param("playerId")

	var player model.Player
	result := model.DB.First(&player, "playerId = ?", playerID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	c.JSON(http.StatusOK, player)
}

func GetEnemy(c *gin.Context) {
	enemyID := c.Param("enemyId")

	var enemy model.Enemy
	result := model.DB.First(&enemy, "enemyId = ?", enemyID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Enemy not found"})
		return
	}

	c.JSON(http.StatusOK, enemy)
}


func SetEnemyHealthHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { Health int `json:"health"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Enemy{}).Where("id = ?", id).Update("health", body.Health).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "health updated"})
}

func SetEnemyWeaponHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { WeaponID uint `json:"weapon_id"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Enemy{}).Where("id = ?", id).Update("weapon_id", body.WeaponID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "weapon update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "weapon updated"})
}

func DeleteEnemyHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Enemy{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "enemy deleted"})
}

func GetRoomHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var room model.Room
	if err := model.DB.Preload("Enemies").Preload("Chest").First(&room, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}
	c.JSON(http.StatusOK, room)
}

func SetRoomClearedHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { Cleared bool `json:"cleared"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Room{}).Where("id = ?", id).Update("cleared", body.Cleared).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "room cleared updated"})
}

func SetRoomChestHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { ChestID uint `json:"chest_id"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Room{}).Where("id = ?", id).Update("chest_id", body.ChestID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "chest update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "room chest updated"})
}

func DeleteRoomHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Room{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "room deleted"})
}

func GetChestHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var chest model.Chest
	if err := model.DB.Preload("Weapon").First(&chest, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "chest not found"})
		return
	}
	c.JSON(http.StatusOK, chest)
}

func SetChestWeaponHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { WeaponID uint `json:"weapon_id"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Chest{}).Where("id = ?", id).Update("weapon_id", body.WeaponID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "weapon update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "chest weapon updated"})
}

func RemoveChestWeaponHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Model(&model.Chest{}).Where("id = ?", id).Update("weapon_id", nil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "weapon remove failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "chest weapon removed"})
}

func DeleteChestHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Chest{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "chest deleted"})
}

func GetWeaponHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var weapon model.Weapon
	if err := model.DB.First(&weapon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "weapon not found"})
		return
	}
	c.JSON(http.StatusOK, weapon)
}

func SetWeaponDamageHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { Damage int `json:"attack_damage"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Weapon{}).Where("id = ?", id).Update("attack_damage", body.Damage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "weapon damage updated"})
}

func DeleteWeaponHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Weapon{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "weapon deleted"})
}

func GetFloorHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var floor model.Floor
	if err := model.DB.Preload("Rooms").First(&floor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "floor not found"})
		return
	}
	c.JSON(http.StatusOK, floor)
}

func SetFloorPlayerInHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { PlayerID *uint `json:"player_id"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Floor{}).Where("id = ?", id).Update("player_in_id", body.PlayerID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "floor player updated"})
}

func DeleteFloorHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Floor{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "floor deleted"})
}

func GetGameHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var game model.Game
	if err := model.DB.
		// Player and their weapons
		Preload("Player").
		Preload("Player.PrimaryWeapon").
		Preload("Player.SecondaryWeapon").
		// Floor → Rooms → Enemies + Chest (+ Chest.Weapon)
		Preload("Floor").
		Preload("Floor.Rooms", func(db *gorm.DB) *gorm.DB {
			return db.
				Preload("Enemies").
				Preload("Chest").
				Preload("Chest.Weapon")
		}).
		// finally load the game row itself
		First(&game, id).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "db error", "details": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, game)
}

func SetGameLevelHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { Level int `json:"level"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Game{}).Where("id = ?", id).Update("level", body.Level).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game level updated"})
}

func SetFloorStoryTextHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct { Text string `json:"story_text"` }
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}
	if err := model.DB.Model(&model.Floor{}).Where("id = ?", id).Update("StoryText", body.Text).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game story text updated"})
}

func DeleteGameHandler(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Game{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "game deleted"})
}
