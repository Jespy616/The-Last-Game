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

type Floors struct {
	Rooms           map[string][][]string `json:"rooms"`
	FloorMap        [][]int               `json:"floorMap"`
	AdjacencyMatrix [][]string            `json:"adjacencyMatrix"`
	FloorTiles      string                `json:"floorTiles"`
	WallTiles       string                `json:"wallTiles"`
}

type Enemy struct {
	Attack int    `json:"attack"`
	Health int    `json:"health"`
	Sprite string `json:"sprite"`
}

type Weapon struct {
	Attack int    `json:"attack"`
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

func runPythonAI(apiKey string, args1, enemies, weapons []string) ([]byte, error) {
	args1JSON, _ := json.Marshal(args1)
	enemiesJSON, _ := json.Marshal(enemies)
	weaponsJSON, _ := json.Marshal(weapons)

	cmd := exec.Command(
		"python3.11", "../ai/ai_agent.py",
		"-k", apiKey,
		"-f", "4", "cave",
		string(args1JSON), string(args1JSON),
		"-e", "4", string(enemiesJSON),
		"-w", "4", string(weaponsJSON),
		"-s", "castle", "cave", "None",
	)

	return cmd.CombinedOutput()
}

func parseAIResponse(output []byte) (FloorData, error) {
	var floorData FloorData
	err := json.Unmarshal(output, &floorData)
	return floorData, err
}

func buildAndSaveFloor(floorData FloorData, c *gin.Context) (model.Floor, error) {
	floor := model.Floor{
		FloorMap:  toJSONString(floorData.Floors.FloorMap),
		Adjacency: toJSONString(floorData.Floors.AdjacencyMatrix),
		Rooms:     []model.Room{},
		StoryText: floorData.Story,
	}

	if err := model.DB.Create(&floor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return floor, err
	}

	roomIndex := 0
	for y, row := range floorData.Floors.FloorMap {
		for x, roomID := range row {
			if roomID == 0 {
				continue
			}

			roomName := fmt.Sprintf("room%d", roomIndex+1)
			roomTiles := convertTilesToString(floorData.Floors.Rooms[roomName])
			roomIndex++

			weaponData := floorData.Weapons[rand.Intn(len(floorData.Weapons))]
			weapon := model.Weapon{
				AttackDamage: weaponData.Attack,
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
				XPos:    uint(x),
				YPos:    uint(y),
				Enemies: []model.Enemy{},
			}

			if err := model.DB.Create(&room).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return floor, err
			}

			if rand.Intn(4) == 1 {
				chest := model.Chest{
					WeaponID: &weapon.ID,
					Weapon:   &weapon,
				}
				if err := model.DB.Create(&chest).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return floor, err
				}
				room.Chest = &chest
				room.ChestID = &chest.ID
			}

			enemyCount := rand.Intn(4)
			for i := 0; i < enemyCount; i++ {
				enemyData := floorData.Enemies[rand.Intn(len(floorData.Enemies))]
				enemy := model.Enemy{
					AttackLevel: enemyData.Attack,
					Health:      enemyData.Health,
					WeaponID:    &weapon.ID,
					Weapon:      &weapon,
					Sprite:      strings.Trim(enemyData.Sprite, "\""),
					PosX:        5,
					PosY:        5,
					RoomID:      room.ID,
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
	apiKey := loadAPIKey()
	args1 := []string{"castle", "cave", "forest"}
	enemies := []string{"goblin", "bat", "knight"}
	weapons := []string{"sword", "spear", "bow"}

	output, err := runPythonAI(apiKey, args1, enemies, weapons)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI agent failed", "details": err.Error()})
		return
	}

	floorData, err := parseAIResponse(output)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parsing failed", "details": err.Error()})
		return
	}

	floor, err := buildAndSaveFloor(floorData, c)
	if err != nil {
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Floor created successfully", "floor": floor})
}

func CreateGame(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	apiKey := loadAPIKey()
	args1 := []string{"castle", "cave", "forest"}
	enemies := []string{"goblin", "bat", "knight"}
	weapons := []string{"sword", "spear", "bow"}

	output, err := runPythonAI(apiKey, args1, enemies, weapons)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI agent failed", "details": err.Error()})
		return
	}

	floorData, err := parseAIResponse(output)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parsing failed", "details": err.Error()})
		return
	}

	floor, err := buildAndSaveFloor(floorData, c)
	if err != nil {
		return
	}

	player := model.Player{
		Health: 10,
		Sprite: "main",
		PosX:   1,
		PosY:   1,
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
		UserID:				  userID,
	}
	if err := model.DB.Create(&game).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game created successfully", "game": game})
}

func SaveGame(c *gin.Context) {
	var game model.Game

	// Bind incoming JSON to game model
	if err := c.ShouldBindJSON(&game); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid game payload", "details": err.Error()})
		return
	}

	// Link FloorID in Game
	if game.Floor.ID != 0 {
		game.FloorID = game.Floor.ID
	}

	// Link PlayerID in Game
	if game.Player.ID != 0 {
		game.PlayerID = game.Player.ID
	}

	// Link Rooms to Floor
	for i := range game.Floor.Rooms {
		room := &game.Floor.Rooms[i]
		room.FloorID = &game.Floor.ID

		// Link Enemies to Room
		for j := range room.Enemies {
			room.Enemies[j].RoomID = room.ID
		}

		// Link Chest to Room (if exists)
		if room.Chest != nil {
			room.Chest.RoomInID = &room.ID
			if room.Chest.Weapon != nil {
				room.Chest.WeaponID = &room.Chest.Weapon.ID
			}
		}
	}

	// Link weapons to Player if they exist
	if game.Player.PrimaryWeapon != nil {
		game.Player.PrimaryWeaponID = &game.Player.PrimaryWeapon.ID
	}
	if game.Player.SecondaryWeapon != nil {
		game.Player.SecondaryWeaponID = &game.Player.SecondaryWeapon.ID
	}

	// --- Save the full object tree ---
	err := model.DB.Session(&gorm.Session{FullSaveAssociations: true}).Create(&game).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save game", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game saved successfully", "game": game})
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
	if err := model.DB.Preload("Player").Preload("Floor").First(&game, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "game not found"})
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
