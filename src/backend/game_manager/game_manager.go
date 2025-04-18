package game_manager

import (
	"backend/model"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"math"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/gin-gonic/gin"
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
	LastStory string `json:"lastStory" binding:"required"`
	LastTheme string `json:"lastTheme" binding:"required"`
}

const (
	cols   = 13
	rows   = 9
	midX   = cols/2  // 6
	midY   = rows/2  // 4
)

var forbidden = map[[2]int]struct{}{
	{midX, 0}:   {},
	{midX, rows-1}: {},
	{0, midY}:   {},
	{cols-1, midY}: {},
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
	return os.Getenv("API_KEY")
}

func runPythonAI(apiKey string, args1, enemies, weapons []string, theme string, pastTheme string, story string) ([]byte, error) {
	args1JSON, _ := json.Marshal(args1)
	enemiesJSON, _ := json.Marshal(enemies)
	weaponsJSON, _ := json.Marshal(weapons)

	cmd := exec.Command(
		"python3", "/app/ai/ai_agent.py",
		"-k", apiKey,
		"-f", "7", "cave",
		string(args1JSON), string(args1JSON),
		"-e", "4", string(enemiesJSON),
		"-w", "4", string(weaponsJSON),
		"-s", pastTheme, theme, story,
	)

	log.Println(cmd)

	return cmd.CombinedOutput()
}

func parseAIResponse(output []byte) (FloorData, error) {
	var floorData FloorData
	err := json.Unmarshal(output, &floorData)
	return floorData, err
}

func pickLocation(roomTiles []rune) (int, int) {
    for {
        // only pick inside the walls (1..cols-2, 1..rows-2)
        x := rand.Intn(cols-2) + 1
        y := rand.Intn(rows-2) + 1

        // skip entrances
        if _, bad := forbidden[[2]int{x, y}]; bad {
            continue
        }

        // compute linear index
        idx := y*cols + x
        if roomTiles[idx] == '.' {
            return x, y
        }
    }
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
			weaponDamage := math.Ceil(float64(weaponData.Attack * (float32(1) + level * multiplier) * (float32(1) + level * multiplier) * difficulty))

			weapon := model.Weapon{
				Damage: 	  float32(weaponDamage),
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
				tiles := []rune(roomTiles) // len == cols*rows
				sx, sy := pickLocation(tiles)


				chest := model.Chest{
					WeaponID: &weapon.ID,
					Weapon:   &weapon,
					PosX: sx,
					PosY: sy,
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
				
				tiles := []rune(roomTiles) // len == cols*rows
				sx, sy := pickLocation(tiles)
				room.StairX = &sx
				room.StairY = &sy
					
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

	output, err := runPythonAI(apiKey, args1, enemies, weapons, config.Theme, config.LastTheme, config.LastTheme)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI agent failed", "details": err.Error()})
		return
	}

	fmt.Println("Python AI Output:", string(output))


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

	output, err := runPythonAI(apiKey, args1, enemies, weapons, config.Theme, "None", "None")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI agent failed", "details": err.Error()})
		log.Println("The AI failed to work, check runPythonAI")
		log.Println("Output from the AI: ")
		log.Println(output)
		log.Println(err.Error())
		return
	}

	floorData, err := parseAIResponse(output)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parsing failed", "details": err.Error()})
		log.Println("The JSon parsing failed to work, check parseAIResponse")
		log.Println(err)
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
	tiles := []rune(start_room.Tiles) // len == cols*rows
	sx, sy := pickLocation(tiles)
	

	player := model.Player{
		MaxHealth: 100,
		CurrentHealth: 100,
		SpriteName: "Knight",
		PosX: sx,
		PosY: sy,
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
	var gameLevel []uint
	if err := model.DB.
		Model(&model.Game{}).
		Where("user_id = ?", userID).
		Pluck("id", &gameIDs).
		Pluck("level", &gameLevel).
		Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch games"})
		return
	}

	// 4) Respond
	c.JSON(http.StatusOK, gin.H{
		"user_d":  userID,
		"GameIDs": gameIDs,
		"Levels": gameLevel,
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
    // Parse the game ID
    id, _ := strconv.Atoi(c.Param("id"))
    var game model.Game

    // Build the query
    if err := model.DB.
        Preload(clause.Associations).

        Preload("Player", func(db *gorm.DB) *gorm.DB {
            return db.Preload(clause.Associations)
        }).

        Preload("Floor", func(db *gorm.DB) *gorm.DB {
            return db.
                Preload(clause.Associations).

                // 4) For each Room, load all its associations (Enemies, Chest → Weapon)
                Preload("Rooms", func(db *gorm.DB) *gorm.DB {
                    return db.Preload(clause.Associations).

					Preload("Chest", func(db *gorm.DB) *gorm.DB {
						return db.Preload(clause.Associations)
					})
                })

        }).

        First(&game, id).Error; err != nil {

        // Handle not‑found vs other errors
        if err == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error":   "db error",
                "details": err.Error(),
            })
        }
        return
    }

    // Return the fully‑populated Game
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
