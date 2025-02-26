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
	stripeID	int
}

type Player struct {
	gorm.Model
	UserID uint
	User	User 
	Health	int
	PrimaryWeaponID uint
	PrimaryWeapon Weapon
	SecondaryWeaponID uint
	SecondaryWeapon Weapon
	SpriteID int
	PosX	int
	PosY	int
}

type Game struct {
	gorm.Model
	Level	int
	FloorID uint
	Floor	Floor
	PlayerSpecifications	string
	PlayerID uint
	Player	Player
	StoryText	string
}

type Floor struct {
	gorm.Model
	Rooms [][]Room `gorm:"foreignKey:FloorID"`
	PlayerInID uint
	PlayerIn Room `gorm:"foreignKey:PlayerInID"`
}

type Room struct {
	gorm.Model
	Enemies	[]Enemy `gorm:"foreignKey:RoomID"`
	Chest	Chest
	AdjacentRooms []Room `gorm:"foreignKey:RoomID;"`
	Cleared	bool
	Tiles [][]string
}

type Enemy struct {
	gorm.Model
	AttackLevel	int	
	Health	int
	WeaponID uint
	Weapon	Weapon
	SpriteID	int
	PosX	int
	PosY	int
}

type Weapon struct {
	gorm.Model
	AttackDamagae	int
	SpriteID	int
	Type	int
}

type Chest struct {
	gorm.Model
	RoomID uint
	RoomIn	*Room `gorm:"constraint:OnDelete:CASCADE"`
	Weapon	Weapon
}
