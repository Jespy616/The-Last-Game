package model

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// Try loading .env-personal first
	err := godotenv.Load(".env-personal")
	if err != nil {
		// If .env-personal doesn't exist, fallback to .env
		log.Println("No .env-personal found, falling back to .env")
		_ = godotenv.Load(".env")
	}

	// Construct the DSN using environment variables
	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=" + os.Getenv("DB_SSLMODE") +
		" TimeZone=" + os.Getenv("DB_TIMEZONE")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = db
	log.Println("Database connected successfully")
}

type User struct {
	gorm.Model
	Username	string
	Email	string `gorm:"unique"`
	password	string
	SubscriptionLevel	int
	stripeId	int
}

type Player struct {
	gorm.Model
	User	User
	Health	int
	PrimaryWeapon Weapon
	SecondaryWeapon Weapon
	SpriteId int
	PosX	int
	PosY	int
}

type Game struct {
	gorm.Model
	Level	int
	Floor	Floor
	PlayerSpecifications	string
	Player	Player
	StoryText	string
}

type Floor struct {
	gorm.Model
	Rooms [][]Room
	PlayerIn Room
}

type Room struct {
	gorm.Model
	Enemies	[]Enemy
	Chest	Chest
	AdjacentRooms []Room	
	Cleared	bool
	Tiles [][]string
}

type Enemy struct {
	gorm.Model
	AttackLevel	int	
	Health	int
	Weapon	Weapon
	SpriteId	int
	PosX	int
	PosY	int
}

type Weapon struct {
	gorm.Model
	AttackDamagae	int
	SpriteId	int
	Type	int
}

type Chest struct {
	gorm.Model
	RoomIn	*Room
	Weapon	Weapon
}

// Make Getters and Setters for bottom for models in the game state manager code. Room, Enemy, chest, Weapon. 
// 9 by 13 Rooms
// . is walkable and w is wall. 
// Set size for floor. 
// Random enemy and chest placement
// 6 by 5 floor. Use example floor from Jaxton in discord.
// For now, utilize dummy data for unit tests in GORM and api endpoints
// add read me to create a local postgres database for local development and testing.