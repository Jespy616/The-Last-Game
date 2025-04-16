package game_manager_test

import (
	"testing"

	"backend/game_manager" // Import your game_manager package
	"backend/model"        // Import the model for database setup

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func SetupTestDB() {
	model.ConnectTestDB()
	model.MigrateDB()
}

// Test Setup
func setup() *gorm.DB {
	SetupTestDB() // Initialize and migrate test DB
	return model.DB
}

// Test Teardown
func teardown() {
	model.TeardownTestDB() // Clean up the test DB
}

func TestEnemyFunctions(t *testing.T) {
	db := setup()
	defer teardown()

	// Create a test Room (required due to foreign key constraint)
	room := model.Room{}
	db.Create(&room)

	// Create test Enemy (must reference an existing Room)
	enemy := model.Enemy{
		Health:     100,
		AttackLevel: 10,
		RoomID:     room.ID, // Ensure the enemy is linked to a valid Room
	}
	db.Create(&enemy)

	// Test GetEnemy
	retrievedEnemy, err := game_manager.GetEnemy(db, enemy.ID)
	assert.NoError(t, err)
	assert.Equal(t, enemy.ID, retrievedEnemy.ID)

	// Test SetEnemyHealth
	err = game_manager.SetEnemyHealth(db, enemy.ID, 50)
	assert.NoError(t, err)
	db.First(&enemy, enemy.ID)
	assert.Equal(t, 50, enemy.Health)

	// Test SetEnemyWeapon
	weapon := model.Weapon{AttackDamage: 20}
	db.Create(&weapon)
	err = game_manager.SetEnemyWeapon(db, enemy.ID, weapon.ID)
	assert.NoError(t, err)
	db.First(&enemy, enemy.ID)
	assert.Equal(t, weapon.ID, *enemy.WeaponID)

	// Test DeleteEnemy
	err = game_manager.DeleteEnemy(db, enemy.ID)
	assert.NoError(t, err)
	var count int64
	db.Model(&model.Enemy{}).Where("id = ?", enemy.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

func TestRoomFunctions(t *testing.T) {
	db := setup()
	defer teardown()

	// Create test room
	room := model.Room{Cleared: false}
	db.Create(&room)

	// Test GetRoom
	retrievedRoom, err := game_manager.GetRoom(db, room.ID)
	assert.NoError(t, err)
	assert.Equal(t, room.ID, retrievedRoom.ID)

	// Test SetRoomCleared
	err = game_manager.SetRoomCleared(db, room.ID, true)
	assert.NoError(t, err)
	db.First(&room, room.ID)
	assert.True(t, room.Cleared)

	// Test SetRoomChest
	chest := model.Chest{}
	db.Create(&chest)
	err = game_manager.SetRoomChest(db, room.ID, chest.ID)
	assert.NoError(t, err)
	db.First(&room, room.ID)
	assert.Equal(t, chest.ID, *room.ChestID)

	// Test DeleteRoom
	err = game_manager.DeleteRoom(db, room.ID)
	assert.NoError(t, err)
	var count int64
	db.Model(&model.Room{}).Where("id = ?", room.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

func TestChestFunctions(t *testing.T) {
	db := setup()
	defer teardown()

	// Create test chest
	chest := model.Chest{}
	db.Create(&chest)

	// Test GetChest
	retrievedChest, err := game_manager.GetChest(db, chest.ID)
	assert.NoError(t, err)
	assert.Equal(t, chest.ID, retrievedChest.ID)

	// Create and Assign Weapon
	weapon := model.Weapon{AttackDamage: 25}
	db.Create(&weapon)
	err = game_manager.SetChestWeapon(db, chest.ID, weapon.ID)
	assert.NoError(t, err)

	// Verify chest has weapon
	db.First(&chest, chest.ID)
	assert.Equal(t, weapon.ID, *chest.WeaponID)

	// Test RemoveChestWeapon
	err = game_manager.RemoveChestWeapon(db, chest.ID)
	assert.NoError(t, err)
	db.First(&chest, chest.ID)
	assert.Nil(t, chest.WeaponID)

	// Test DeleteChest
	err = game_manager.DeleteChest(db, chest.ID)
	assert.NoError(t, err)
	var count int64
	db.Model(&model.Chest{}).Where("id = ?", chest.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

///// ⚔️ Weapon Tests /////

func TestWeaponFunctions(t *testing.T) {
	db := setup()
	defer teardown()

	// Create test weapon
	weapon := model.Weapon{AttackDamage: 30}
	db.Create(&weapon)

	// Test GetWeapon
	retrievedWeapon, err := game_manager.GetWeapon(db, weapon.ID)
	assert.NoError(t, err)
	assert.Equal(t, weapon.ID, retrievedWeapon.ID)

	// Test SetWeaponDamage
	err = game_manager.SetWeaponDamage(db, weapon.ID, 40)
	assert.NoError(t, err)
	db.First(&weapon, weapon.ID)
	assert.Equal(t, 40, weapon.AttackDamage)

	// Test DeleteWeapon
	err = game_manager.DeleteWeapon(db, weapon.ID)
	assert.NoError(t, err)
	var count int64
	db.Model(&model.Weapon{}).Where("id = ?", weapon.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

func TestFloorFunctions(t *testing.T) {
	db := setup()
	defer teardown()

	// Create test floor
	floor := model.Floor{}
	db.Create(&floor)

	// Test GetFloor
	retrievedFloor, err := game_manager.GetFloor(db, floor.ID)
	assert.NoError(t, err)
	assert.Equal(t, floor.ID, retrievedFloor.ID)

	// Test SetFloorPlayerIn
	player := model.Player{Health: 100}
	db.Create(&player)

	err = game_manager.SetFloorPlayerIn(db, floor.ID, &player.ID)
	assert.NoError(t, err)

	db.First(&floor, floor.ID)
	assert.NotNil(t, floor.PlayerInID)
	assert.Equal(t, player.ID, floor.PlayerInID)

	// Test DeleteFloor
	err = game_manager.DeleteFloor(db, floor.ID)
	assert.NoError(t, err)
	var count int64
	db.Model(&model.Floor{}).Where("id = ?", floor.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

func TestGameFunctions(t *testing.T) {
	db := setup()
	defer teardown()

	// Create dependencies
	user := model.User{Username: "testuser", Email: "test@example.com", Password: "password"}
	db.Create(&user)

	primaryWeapon := model.Weapon{AttackDamage: 10}
	secondaryWeapon := model.Weapon{AttackDamage: 5}
	db.Create(&primaryWeapon)
	db.Create(&secondaryWeapon)

	player := model.Player{
		UserID:            user.ID,
		Health:            100,
		PrimaryWeaponID:   primaryWeapon.ID,
		SecondaryWeaponID: secondaryWeapon.ID,
	}
	db.Create(&player)

	floor := model.Floor{}
	db.Create(&floor)

	// Create test game
	game := model.Game{
		Level:               1,
		PlayerID:            player.ID,
		FloorID:             floor.ID,
		PlayerSpecifications: "",
		StoryText:           "Once upon a time...",
	}
	db.Create(&game)

	// Test GetGame
	retrievedGame, err := game_manager.GetGame(db, game.ID)
	assert.NoError(t, err)
	assert.Equal(t, game.ID, retrievedGame.ID)

	// Test SetGameLevel
	err = game_manager.SetGameLevel(db, game.ID, 2)
	assert.NoError(t, err)
	db.First(&game, game.ID)
	assert.Equal(t, 2, game.Level)

	// Test SetGameStoryText
	newText := "The story continues..."
	err = game_manager.SetGameStoryText(db, game.ID, newText)
	assert.NoError(t, err)
	db.First(&game, game.ID)
	assert.Equal(t, newText, game.StoryText)

	// Test DeleteGame
	err = game_manager.DeleteGame(db, game.ID)
	assert.NoError(t, err)
	var count int64
	db.Model(&model.Game{}).Where("id = ?", game.ID).Count(&count)
	assert.Equal(t, int64(0), count)
}

