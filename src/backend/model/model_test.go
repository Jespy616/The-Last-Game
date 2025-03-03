package model_test

import (
	"backend/model"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func SetupTestDB() {
	model.ConnectTestDB()
	model.MigrateDB()
}

func TestUserCRUD(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	user := model.User{
		Username:          "testuser",
		Email:             "test@example.com",
		Password: 		   "password123",
		SubscriptionLevel: 1,
		StripeID:          1,
	}
	result := model.DB.Create(&user)
	assert.Nil(t, result.Error, "Failed to create user")

	var retrievedUser model.User
	result = model.DB.First(&retrievedUser, user.ID)
	assert.Nil(t, result.Error, "Failed to retrieve user")
	assert.Equal(t, user.Username, retrievedUser.Username)
	assert.Equal(t, user.Email, retrievedUser.Email)

	retrievedUser.SubscriptionLevel = 2
	result = model.DB.Save(&retrievedUser)
	assert.Nil(t, result.Error, "Failed to update user")

	var updatedUser model.User
	result = model.DB.First(&updatedUser, user.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated user")
	assert.Equal(t, 2, updatedUser.SubscriptionLevel)

	result = model.DB.Delete(&updatedUser)
	assert.Nil(t, result.Error, "Failed to delete user")

	result = model.DB.First(&retrievedUser, user.ID)
	assert.NotNil(t, result.Error, "User should not exist after deletion")
}

func TestPlayerCrud(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create User
	user := model.User{
		Username:          "testuser",
		Email:             "test@example.com",
		Password:          "password123",
		SubscriptionLevel: 1,
		StripeID:          1,
	}
	result := model.DB.Create(&user)
	assert.Nil(t, result.Error, "Failed to create user")

	// Create Primary Weapon
	primaryWeapon := model.Weapon{
		AttackDamage: 1,
		SpriteID: 3,
		Type:     1,
	}
	result = model.DB.Create(&primaryWeapon)
	assert.Nil(t, result.Error, "Failed to create primary weapon")

	// Create Secondary Weapon
	secondaryWeapon := model.Weapon{
		AttackDamage: 1,
		SpriteID: 3,
		Type:     1,
	}
	result = model.DB.Create(&secondaryWeapon)
	assert.Nil(t, result.Error, "Failed to create secondary weapon")

	// Create Player with correct IDs
	player := model.Player{
		UserID:           user.ID,  
		User:             user, 
		Health:           100,
		PrimaryWeaponID:  primaryWeapon.ID,
		PrimaryWeapon:    primaryWeapon,
		SecondaryWeaponID: secondaryWeapon.ID,
		SecondaryWeapon:  secondaryWeapon,
		SpriteID:         1,
		PosX:             1,
		PosY:             1,
	}
	result = model.DB.Create(&player)
	assert.Nil(t, result.Error, "Failed to create player")

	// Retrieve Player with Preload
	var retrievedplayer model.Player
	result = model.DB.
		Preload("User").
		Preload("PrimaryWeapon").
		Preload("SecondaryWeapon").
		First(&retrievedplayer, player.ID)
	assert.Nil(t, result.Error, "Failed to retrieve player")
	assert.Equal(t, player.User.Username, retrievedplayer.User.Username) // Compare a field, not whole struct
	assert.Equal(t, player.Health, retrievedplayer.Health)
	assert.Equal(t, player.PrimaryWeapon.AttackDamage, retrievedplayer.PrimaryWeapon.AttackDamage)
	assert.Equal(t, player.SecondaryWeapon.AttackDamage, retrievedplayer.SecondaryWeapon.AttackDamage)
	assert.Equal(t, player.PosX, retrievedplayer.PosX)
	assert.Equal(t, player.PosY, retrievedplayer.PosY)

	// Update Player
	retrievedplayer.Health = 200
	result = model.DB.Save(&retrievedplayer)
	assert.Nil(t, result.Error, "Failed to update player")

	// Retrieve Updated Player
	var updatedplayer model.Player
	result = model.DB.
		Preload("User").
		Preload("PrimaryWeapon").
		Preload("SecondaryWeapon").
		First(&updatedplayer, player.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated player")
	assert.Equal(t, 200, updatedplayer.Health)

	// Delete Player
	result = model.DB.Delete(&updatedplayer)
	assert.Nil(t, result.Error, "Failed to delete player")

	// Verify Deletion
	result = model.DB.First(&retrievedplayer, player.ID)
	assert.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Player should not exist after deletion")
}

func TestGameCrud(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create User
	user := model.User{
		Username:          "testuser",
		Email:             "test@example.com",
		Password:          "password123",
		SubscriptionLevel: 1,
		StripeID:          1,
	}
	result := model.DB.Create(&user)
	assert.Nil(t, result.Error, "Failed to create user")

	// Create Weapons
	primaryWeapon := model.Weapon{AttackDamage: 1, SpriteID: 3, Type: 1}
	secondaryWeapon := model.Weapon{AttackDamage: 1, SpriteID: 3, Type: 1}

	result = model.DB.Create(&primaryWeapon)
	assert.Nil(t, result.Error, "Failed to create primary weapon")
	result = model.DB.Create(&secondaryWeapon)
	assert.Nil(t, result.Error, "Failed to create secondary weapon")

	// Create Player
	player := model.Player{
		UserID:            user.ID,
		Health:            100,
		PrimaryWeaponID:   primaryWeapon.ID,
		PrimaryWeapon:     primaryWeapon,
		SecondaryWeaponID: secondaryWeapon.ID,
		SecondaryWeapon:   secondaryWeapon,
		SpriteID:          1,
		PosX:              1,
		PosY:              1,
	}
	result = model.DB.Create(&player)
	assert.Nil(t, result.Error, "Failed to create player")

	// Create Room (without a FloorID to avoid foreign key constraint issues)
	room := model.Room{Cleared: false, Tiles: "Test Tiles", XPos: 5, YPos: 5}
	result = model.DB.Create(&room)
	assert.Nil(t, result.Error, "Failed to create room")

	// Create Floor and associate the room with it
	floor := model.Floor{}
	result = model.DB.Create(&floor)
	assert.Nil(t, result.Error, "Failed to create floor")

	// Now update the room with the correct FloorID
	room.FloorID = &floor.ID
	result = model.DB.Save(&room)
	assert.Nil(t, result.Error, "Failed to update room with floor ID")

	// Create Game
	game := model.Game{
		Level:               1,
		FloorID:             floor.ID, // Use valid FloorID
		PlayerSpecifications: "Test specifications",
		PlayerID:            player.ID, // Use valid PlayerID
		StoryText:           "Once upon a time...",
	}
	result = model.DB.Create(&game)
	assert.Nil(t, result.Error, "Failed to create game")

	// Retrieve Game with Preloaded Fields
	var retrievedGame model.Game
	result = model.DB.
		Preload("Floor").
		Preload("Player").
		First(&retrievedGame, game.ID)
	assert.Nil(t, result.Error, "Failed to retrieve game")
	assert.Equal(t, game.Level, retrievedGame.Level)
	assert.Equal(t, game.PlayerSpecifications, retrievedGame.PlayerSpecifications)
	assert.Equal(t, game.StoryText, retrievedGame.StoryText)
	assert.Equal(t, game.PlayerID, retrievedGame.PlayerID)
	assert.Equal(t, game.FloorID, retrievedGame.FloorID)

	// Update Game
	retrievedGame.Level = 2
	retrievedGame.StoryText = "A new chapter begins..."
	result = model.DB.Save(&retrievedGame)
	assert.Nil(t, result.Error, "Failed to update game")

	// Retrieve Updated Game
	var updatedGame model.Game
	result = model.DB.
		Preload("Floor").
		Preload("Player").
		First(&updatedGame, game.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated game")
	assert.Equal(t, 2, updatedGame.Level)
	assert.Equal(t, "A new chapter begins...", updatedGame.StoryText)

	// Delete Game
	result = model.DB.Delete(&updatedGame)
	assert.Nil(t, result.Error, "Failed to delete game")

	// Verify Deletion
	result = model.DB.First(&retrievedGame, game.ID)
	assert.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Game should not exist after deletion")
}

func TestFloorCrud(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create Floor
	floor := model.Floor{}
	result := model.DB.Create(&floor)
	assert.Nil(t, result.Error, "Failed to create floor")

	// Retrieve Floor
	var retrievedFloor model.Floor
	result = model.DB.First(&retrievedFloor, floor.ID)
	assert.Nil(t, result.Error, "Failed to retrieve floor")
	assert.Equal(t, floor.ID, retrievedFloor.ID, "Retrieved floor ID should match")

	// Create Room associated with Floor
	room := model.Room{
		FloorID: &retrievedFloor.ID,
		Tiles:   "Sample room layout",
		XPos:    1,
		YPos:    1,
		Cleared: false,
	}
	result = model.DB.Create(&room)
	assert.Nil(t, result.Error, "Failed to create room")

	// Verify Room is Linked to Floor
	var floorWithRooms model.Floor
	result = model.DB.Preload("Rooms").First(&floorWithRooms, floor.ID)
	assert.Nil(t, result.Error, "Failed to retrieve floor with rooms")
	assert.Len(t, floorWithRooms.Rooms, 1, "Floor should have one room")

	// Update Floor (Assign a Room to PlayerInID)
	floorWithRooms.PlayerInID = &room.ID
	result = model.DB.Save(&floorWithRooms)
	assert.Nil(t, result.Error, "Failed to update floor's PlayerInID")

	// Retrieve Updated Floor
	var updatedFloor model.Floor
	result = model.DB.First(&updatedFloor, floor.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated floor")
	assert.NotNil(t, updatedFloor.PlayerInID, "PlayerInID should not be nil")
	assert.Equal(t, *updatedFloor.PlayerInID, room.ID, "PlayerInID should match Room ID")

	// Delete Floor
	result = model.DB.Delete(&updatedFloor)
	assert.Nil(t, result.Error, "Failed to delete floor")

	// Verify Floor Deletion
	result = model.DB.First(&retrievedFloor, floor.ID)
	assert.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Floor should not exist after deletion")
}

func TestRoomCrud(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create Floor (optional)
	floor := model.Floor{}
	result := model.DB.Create(&floor)
	assert.Nil(t, result.Error, "Failed to create floor")

	// Create Weapon (for Enemies and Chest)
	weapon := model.Weapon{
		AttackDamage: 10,
		SpriteID:     5,
		Type:         1,
	}
	result = model.DB.Create(&weapon)
	assert.Nil(t, result.Error, "Failed to create weapon")

	// Create Chest (optional)
	chest := model.Chest{
		WeaponID: &weapon.ID,
	}
	result = model.DB.Create(&chest)
	assert.Nil(t, result.Error, "Failed to create chest")

	// Create Room
	room := model.Room{
		FloorID: &floor.ID, 
		Cleared: false,
		Tiles:   "Initial Tiles",
		XPos:    3,
		YPos:    4,
	}
	result = model.DB.Create(&room)
	assert.Nil(t, result.Error, "Failed to create room")

	// Retrieve Room with relationships
	var retrievedRoom model.Room
	result = model.DB.Preload("Floor").First(&retrievedRoom, room.ID)
	assert.Nil(t, result.Error, "Failed to retrieve room")
	assert.Equal(t, room.XPos, retrievedRoom.XPos)
	assert.Equal(t, room.YPos, retrievedRoom.YPos)
	assert.Equal(t, *room.FloorID, *retrievedRoom.FloorID, "Floor ID mismatch")

	// Add Chest to Room
	retrievedRoom.ChestID = &chest.ID
	result = model.DB.Save(&retrievedRoom)
	assert.Nil(t, result.Error, "Failed to update room with chest")

	// Verify Room now has Chest
	var updatedRoom model.Room
	result = model.DB.Preload("Chest").First(&updatedRoom, room.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated room")
	assert.NotNil(t, updatedRoom.ChestID, "Room's ChestID should not be nil")

	// Create Enemy for the Room
	enemy := model.Enemy{
		AttackLevel: 5,
		Health:      50,
		WeaponID:    &weapon.ID,
		RoomID:      room.ID,
		PosX:        1,
		PosY:        2,
	}
	result = model.DB.Create(&enemy)
	assert.Nil(t, result.Error, "Failed to create enemy")

	// Verify Room now has an Enemy
	var roomWithEnemies model.Room
	result = model.DB.Preload("Enemies").First(&roomWithEnemies, room.ID)
	assert.Nil(t, result.Error, "Failed to retrieve room with enemies")
	assert.Equal(t, 1, len(roomWithEnemies.Enemies), "Room should have one enemy")

	// Create Adjacent Room
	adjacentRoom := model.Room{
		Cleared: false,
		Tiles:   "Adjacent Tiles",
		XPos:    4,
		YPos:    4,
	}
	result = model.DB.Create(&adjacentRoom)
	assert.Nil(t, result.Error, "Failed to create adjacent room")

	// Link Rooms via Many-to-Many
	err := model.DB.Model(&room).Association("AdjacentRooms").Append(&adjacentRoom)
	assert.Nil(t, err, "Failed to add adjacent room")

	// Retrieve Room and Verify Adjacent Room
	var roomWithAdjacents model.Room
	result = model.DB.Preload("AdjacentRooms").First(&roomWithAdjacents, room.ID)
	assert.Nil(t, result.Error, "Failed to retrieve room with adjacent rooms")
	assert.Equal(t, 1, len(roomWithAdjacents.AdjacentRooms), "Room should have one adjacent room")

	// Delete Room and Verify Cascading Deletions
	result = model.DB.Delete(&room)
	assert.Nil(t, result.Error, "Failed to delete room")

	// Check Room is deleted
	result = model.DB.First(&retrievedRoom, room.ID)
	assert.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Room should not exist after deletion")

	// Check Chest is NOT deleted (should remain)
	var existingChest model.Chest
	result = model.DB.First(&existingChest, chest.ID)
	assert.Nil(t, result.Error, "Chest should not be deleted when Room is deleted")

	// Check Adjacent Room still exists (many-to-many does not cascade)
	var existingAdjacentRoom model.Room
	result = model.DB.First(&existingAdjacentRoom, adjacentRoom.ID)
	assert.Nil(t, result.Error, "Adjacent room should not be deleted when original Room is deleted")
}

func TestEnemyCrud(t *testing.T) {
	// Setup Test Database
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create Floor
	floor := model.Floor{}
	result := model.DB.Create(&floor)
	assert.Nil(t, result.Error, "Failed to create floor")

	// Create Room
	room := model.Room{
		FloorID: &floor.ID,
		Cleared: false,
		Tiles:   "Test Tiles",
		XPos:    5,
		YPos:    5,
	}
	result = model.DB.Create(&room)
	assert.Nil(t, result.Error, "Failed to create room")

	// Create Weapon (Optional)
	weapon := model.Weapon{
		AttackDamage: 15,
		SpriteID:     2,
		Type:         1,
	}
	result = model.DB.Create(&weapon)
	assert.Nil(t, result.Error, "Failed to create weapon")

	// Create Enemy
	enemy := model.Enemy{
		AttackLevel: 3,
		Health:      100,
		WeaponID:    &weapon.ID,
		Weapon:      &weapon,
		SpriteID:    10,
		RoomID:      room.ID,
		Room:        room,
		PosX:        2,
		PosY:        3,
	}
	result = model.DB.Create(&enemy)
	assert.Nil(t, result.Error, "Failed to create enemy")

	// Retrieve Enemy
	var retrievedEnemy model.Enemy
	result = model.DB.Preload("Weapon").Preload("Room").First(&retrievedEnemy, enemy.ID)
	assert.Nil(t, result.Error, "Failed to retrieve enemy")
	assert.Equal(t, enemy.Health, retrievedEnemy.Health)
	assert.Equal(t, enemy.AttackLevel, retrievedEnemy.AttackLevel)
	assert.Equal(t, enemy.SpriteID, retrievedEnemy.SpriteID)
	assert.Equal(t, enemy.PosX, retrievedEnemy.PosX)
	assert.Equal(t, enemy.PosY, retrievedEnemy.PosY)
	assert.NotNil(t, retrievedEnemy.Weapon, "Weapon should be loaded")
	assert.NotNil(t, retrievedEnemy.Room, "Room should be loaded")

	// Update Enemy
	retrievedEnemy.Health = 50
	retrievedEnemy.PosX = 4
	retrievedEnemy.PosY = 1
	result = model.DB.Save(&retrievedEnemy)
	assert.Nil(t, result.Error, "Failed to update enemy")

	// Retrieve Updated Enemy
	var updatedEnemy model.Enemy
	result = model.DB.Preload("Weapon").Preload("Room").First(&updatedEnemy, enemy.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated enemy")
	assert.Equal(t, 50, updatedEnemy.Health)
	assert.Equal(t, 4, updatedEnemy.PosX)
	assert.Equal(t, 1, updatedEnemy.PosY)

	// Delete Weapon (Should Set Enemy's WeaponID to NULL)
	result = model.DB.Delete(&weapon)
	assert.Nil(t, result.Error, "Failed to delete weapon")

}

func TestWeaponCrud(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create a Weapon
	weapon := model.Weapon{AttackDamage: 25, SpriteID: 4, Type: 2}
	result := model.DB.Create(&weapon)
	assert.Nil(t, result.Error, "Failed to create weapon")

	// Retrieve Weapon
	var retrievedWeapon model.Weapon
	result = model.DB.First(&retrievedWeapon, weapon.ID)
	assert.Nil(t, result.Error, "Failed to retrieve weapon")
	assert.Equal(t, weapon.AttackDamage, retrievedWeapon.AttackDamage)
	assert.Equal(t, weapon.SpriteID, retrievedWeapon.SpriteID)
	assert.Equal(t, weapon.Type, retrievedWeapon.Type)

	// Update Weapon
	retrievedWeapon.AttackDamage = 30
	result = model.DB.Save(&retrievedWeapon)
	assert.Nil(t, result.Error, "Failed to update weapon")

	// Retrieve Updated Weapon
	var updatedWeapon model.Weapon
	result = model.DB.First(&updatedWeapon, weapon.ID)
	assert.Nil(t, result.Error, "Failed to retrieve updated weapon")
	assert.Equal(t, 30, updatedWeapon.AttackDamage)

	// Delete Weapon
	result = model.DB.Delete(&updatedWeapon)
	assert.Nil(t, result.Error, "Failed to delete weapon")

	// Verify Deletion
	result = model.DB.First(&retrievedWeapon, weapon.ID)
	assert.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Weapon should not exist after deletion")
}

func TestChestCrud(t *testing.T) {
	SetupTestDB()
	defer model.TeardownTestDB()

	// Create a Weapon
	weapon := model.Weapon{AttackDamage: 15, SpriteID: 3, Type: 1}
	model.DB.Create(&weapon)

	// Create a Chest with a Weapon
	chest := model.Chest{WeaponID: &weapon.ID}
	result := model.DB.Create(&chest)
	assert.Nil(t, result.Error, "Failed to create chest")

	// Retrieve Chest
	var retrievedChest model.Chest
	result = model.DB.Preload("Weapon").First(&retrievedChest, chest.ID)
	assert.Nil(t, result.Error, "Failed to retrieve chest")
	assert.NotNil(t, retrievedChest.Weapon, "Weapon should be loaded in chest")

	// Delete Chest
	result = model.DB.Delete(&retrievedChest)
	assert.Nil(t, result.Error, "Failed to delete chest")

	// Verify Deletion
	result = model.DB.First(&retrievedChest, chest.ID)
	assert.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Chest should not exist after deletion")
}