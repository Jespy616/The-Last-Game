package game_manager

import (
	"backend/model"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func convertTilesToString(tiles [][]string) string {
	result := ""
	for _, row := range tiles {
		for _, col := range row {
			result += col
		}
		result += ""
	}
	return result
}

func toJSONString(v interface{}) string {
	data, _ := json.Marshal(v)
	return string(data)
}

type FloorData struct {
	Rooms           map[string][][]string `json:"rooms"`
	FloorMap        [][]int               `json:"floorMap"`
	AdjacencyMatrix [][]string            `json:"adjacencyMatrix"`
}

type RoomNeighbors struct {
	RoomID int
	Top    *int
	Bottom *int
	Left   *int
	Right  *int
}

func getRoomNeighbors(floorMap [][]int) map[int]RoomNeighbors {
	neighbors := make(map[int]RoomNeighbors) // Store room connections

	rows := len(floorMap)
	cols := len(floorMap[0])

	// Iterate through the floorMap
	for y := 0; y < rows; y++ {
		for x := 0; x < cols; x++ {
			roomID := floorMap[y][x]

			// Ignore empty spaces (0 values)
			if roomID == 0 {
				continue
			}

			// Initialize the RoomNeighbors struct
			roomNeighbors := RoomNeighbors{RoomID: roomID}

			// Check the top room
			if y > 0 && floorMap[y-1][x] != 0 {
				roomNeighbors.Top = &floorMap[y-1][x]
			}

			// Check the bottom room
			if y < rows-1 && floorMap[y+1][x] != 0 {
				roomNeighbors.Bottom = &floorMap[y+1][x]
			}

			// Check the left room
			if x > 0 && floorMap[y][x-1] != 0 {
				roomNeighbors.Left = &floorMap[y][x-1]
			}

			// Check the right room
			if x < cols-1 && floorMap[y][x+1] != 0 {
				roomNeighbors.Right = &floorMap[y][x+1]
			}

			// Store the room's neighbors in the map
			neighbors[roomID] = roomNeighbors
		}
	}

	return neighbors
}

func CreateUser(c *gin.Context) {
	user := model.User{
		Username:          "Test",
		Email:             "Test@email.com",
		Password:          "password",
		SubscriptionLevel: 0,
		StripeID:          1,
	}

	if err := model.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

}

func CreateGame(c *gin.Context) {
	weapon := model.Weapon{
		AttackDamage: 10,
		SpriteID:     1,
		Type:         1,
	}

	if err := model.DB.Create(&weapon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	chest := model.Chest{
		WeaponID: &weapon.ID,
		Weapon:   &weapon,
	}

	if err := model.DB.Create(&chest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err := godotenv.Load(".env-personal")
	if err != nil {
		log.Println("No .env-personal found, falling back to .env")
		_ = godotenv.Load(".env")
	}
	api_key := os.Getenv("API_KEY")

	args1, _ := json.Marshal([]int{1, 2, 3, 4, 5})
	args2, _ := json.Marshal([]int{6, 7, 8, 9})
	cmd := exec.Command("python3.11", "../ai/ai_agent.py", "-k", api_key, "-f", "4", "castle",
		string(args1), string(args2))
	jsonData, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Error executing Python script: %v", err)
		return
	}

	var floorData FloorData
	err2 := json.Unmarshal([]byte(jsonData), &floorData)
	if err2 != nil {
		log.Fatal("Error parsing JSON:", err)
	}

	// Create a new Floor object
	floor := model.Floor{
		FloorMap:   toJSONString(floorData.FloorMap),
		Adjacency:  toJSONString(floorData.AdjacencyMatrix),
		Rooms:      []model.Room{},
		PlayerInID: uint(1),
	}

	// Save Floor first to get the ID for Room foreign keys
	if err := model.DB.Create(&floor).Error; err != nil {
		log.Fatal("Error saving Floor:", err)
	}

	roomIndex := 0
	for y, row := range floorData.FloorMap {
		for x, roomID := range row {
			if roomID == 0 {
				continue // Ignore empty positions
			}
			roomName := fmt.Sprintf("room%d", roomIndex+1)
			// Get the correct room matrix
			roomTiles := convertTilesToString(floorData.Rooms[roomName])
			roomIndex++

			room := model.Room{
				FloorID: &floor.ID,
				Tiles:   roomTiles,
				XPos:    uint(x),
				YPos:    uint(y),
				ChestID: &chest.ID,
				Chest:   &chest,
				Cleared: false,
				Enemies: []model.Enemy{},
			}

			// Save Room
			if err := model.DB.Create(&room).Error; err != nil {
				log.Fatal("Error saving Room:", err)
			}

			enemy := model.Enemy{
				AttackLevel: 1,
				Health:      10,
				WeaponID:    &weapon.ID,
				Weapon:      &weapon,
				SpriteID:    1,
				PosX:        5,
				PosY:        5,
				RoomID:      room.ID,
			}

			if err := model.DB.Create(&enemy).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			room.Enemies = append(room.Enemies, enemy)

			floor.Rooms = append(floor.Rooms, room)
		}
	}

	if err := model.DB.Save(&floor).Error; err != nil {
		log.Fatal("Error updating Floor with Rooms:", err)
	}

	neighbors := getRoomNeighbors(floorData.FloorMap)

	fmt.Printf("Length of Floor Rooms: %d", len(floor.Rooms))
	fmt.Printf("\nFloor map: %s", floor.FloorMap)
	for _, room_neighbors := range neighbors {
		room := &floor.Rooms[room_neighbors.RoomID-1]
		if room_neighbors.Top != nil {
			topIndex := *room_neighbors.Top - 1
			room.TopID = &floor.Rooms[topIndex].ID
		}
		if room_neighbors.Bottom != nil {
			bottomIndex := *room_neighbors.Bottom - 1
			room.BottomID = &floor.Rooms[bottomIndex].ID
		}
		if room_neighbors.Right != nil {
			rightIndex := *room_neighbors.Right - 1
			room.RightID = &floor.Rooms[rightIndex].ID
		}
		if room_neighbors.Left != nil {
			leftIndex := *room_neighbors.Left - 1
			room.LeftID = &floor.Rooms[leftIndex].ID
		}
		if err := model.DB.Save(&room).Error; err != nil {
			log.Fatal("Error updating room:", err)
		}
	}

	player := model.Player{
		Health:            100,
		PrimaryWeaponID:   weapon.ID,
		PrimaryWeapon:     weapon,
		SecondaryWeaponID: weapon.ID,
		SecondaryWeapon:   weapon,
		SpriteID:          1,
		PosX:              1,
		PosY:              1,
	}

	if err := model.DB.Create(&player).Error; err != nil {
		log.Fatal("Error saving Room:", err)
	}

	game := model.Game{
		Level:                1,
		FloorID:              floor.ID,
		Floor:                floor,
		PlayerSpecifications: "Cool Game",
		PlayerID:             player.ID,
		Player:               player,
		StoryText:            "Once upon a time...",
	}

	if err := model.DB.Create(&game).Error; err != nil {
		log.Fatal("Error saving Room:", err)
	}

	log.Println("Game created successfully with specific attributes!")
	c.JSON(http.StatusOK, gin.H{"message": "Game created successfully", "game": game})
}

// GET REQUESTS

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
	result := model.DB.First(&player, "ID = ?", playerID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	c.JSON(http.StatusOK, player)
}
