package model

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Base connect function that will be modified to meet database .env specifications
func ConnectDB() {
	dsn := "host=localhost user=myuser password=mypassword dbname=mydatabase port=5432 sslmode=disable TimeZone=UTC"

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
	Password	string
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
	PlaeryIn Room
}

type Room struct {
	gorm.Model
	Enemies	[]Enemy
	Chest	Chest
	AdjacentRooms []Room	
	Cleared	bool
}

type Enemy struct {
	gorm.Model
	AttackLevel	int	
	AttackFrequency	int
	Health	int
	SpriteId	int
}

type Weapon struct {
	gorm.Model
	Health	int
	AttackDamagae	int
}

type Chest struct {
	gorm.Model
	RoomIn	*Room
	Weapon	Weapon
}