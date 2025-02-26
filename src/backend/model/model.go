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
	err := godotenv.Load(".env-personal")
	if err != nil {
		log.Println("No .env-personal found, falling back to .env")
		_ = godotenv.Load(".env")
	}

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
